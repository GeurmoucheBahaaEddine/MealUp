import express from 'express';
import { Dish, Ingredient } from '../models/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to check if a dish is available based on its ingredients' stock
const checkDishAvailability = (dish) => {
    try {
        const plainDish = typeof dish.get === 'function' ? dish.get({ plain: true }) : dish;
        const ingredients = plainDish.ingredients || [];

        if (ingredients.length === 0) return true;

        const outOfStock = ingredients.some(ing => {
            if (!ing) return false;
            // Find junction info - check multiple possible naming conventions from Sequelize
            const junction = ing.DishIngredient || ing.dish_ingredient || ing.dish_ingredients || {};

            // If it's a base ingredient (not is_extra) and stock is 0 or less
            // Default to not extra if junction info is missing to be safe
            const isExtra = junction.is_extra === true;
            const isOutOfStock = (ing.stock_actuel !== undefined ? ing.stock_actuel : 1) <= 0;

            return !isExtra && isOutOfStock;
        });

        return !outOfStock;
    } catch (err) {
        console.error('checkDishAvailability error:', err);
        return true; // Fallback to available if check fails
    }
};

// Get all dishes
router.get('/', async (req, res) => {
    try {
        const { includeUnavailable } = req.query;
        const where = {};

        if (includeUnavailable !== 'true') {
            where.is_available = true;
        }

        const dishes = await Dish.findAll({
            where,
            include: [{ model: Ingredient, as: 'ingredients' }]
        });

        // Dynamic availability check based on ingredient stock
        const dishesWithAvailability = dishes.map(dish => {
            const plainDish = dish.get({ plain: true });
            const dynamicAvailable = checkDishAvailability(plainDish);

            if (!dynamicAvailable) {
                plainDish.is_available = false;
            }

            return plainDish;
        });

        // Si on ne veut que les disponibles, on filtre APRÈS le check dynamique
        if (includeUnavailable !== 'true') {
            res.json(dishesWithAvailability.filter(d => d.is_available));
        } else {
            res.json(dishesWithAvailability);
        }
    } catch (error) {
        console.error('Get dishes error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des plats', error: error.message });
    }
});

// Get popular dishes (for home page)
router.get('/popular', async (req, res) => {
    try {
        const dishes = await Dish.findAll({
            where: {
                is_available: true,
                is_popular: true
            },
            limit: 6,
            include: [{ model: Ingredient, as: 'ingredients' }]
        });

        const availableDishes = dishes
            .map(d => d.get({ plain: true }))
            .filter(checkDishAvailability);

        res.json(availableDishes);
    } catch (error) {
        console.error('Get popular dishes error:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des plats populaires',
            error: error.message
        });
    }
});

// Get new dishes
router.get('/new', async (req, res) => {
    try {
        const dishes = await Dish.findAll({
            where: {
                is_available: true,
                is_new: true
            },
            order: [['id', 'DESC']],
            limit: 3,
            include: [{ model: Ingredient, as: 'ingredients' }]
        });

        const availableDishes = dishes
            .map(d => d.get({ plain: true }))
            .filter(checkDishAvailability);

        res.json(availableDishes);
    } catch (error) {
        console.error('Get new dishes error:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des nouveaux plats',
            error: error.message
        });
    }
});

// Get dish by ID
router.get('/:id', async (req, res) => {
    try {
        const dish = await Dish.findByPk(req.params.id, {
            include: [{ model: Ingredient, as: 'ingredients' }]
        });
        if (!dish) {
            return res.status(404).json({ message: 'Plat non trouvé' });
        }
        res.json(dish);
    } catch (error) {
        console.error('Error fetching dishes:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des plats',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Add new dish (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { nom, prix, categorie, image_url, description, ingredients, is_popular, is_new, stock } = req.body;

        const dish = await Dish.create({
            nom,
            prix: parseFloat(prix),
            categorie,
            image_url,
            description,
            is_popular: !!is_popular,
            is_new: !!is_new,
            stock: parseInt(stock) || 0
        });

        if (ingredients && Array.isArray(ingredients)) {
            // ingredients can be [id1, id2] or [{id: 1, is_extra: false}, ...]
            for (const ing of ingredients) {
                const ingId = typeof ing === 'object' ? ing.id : ing;
                const isExtra = typeof ing === 'object' ? !!ing.is_extra : false;
                await dish.addIngredient(ingId, { through: { is_extra: isExtra } });
            }
        }

        const dishWithIngredients = await Dish.findByPk(dish.id, {
            include: [{ model: Ingredient, as: 'ingredients' }]
        });

        res.status(201).json({
            message: 'Plat ajouté avec succès!',
            dish: dishWithIngredients
        });
    } catch (error) {
        console.error('Add dish error:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du plat' });
    }
});

// Toggle availability (admin only)
router.put('/:id/toggle-availability', authenticateToken, isAdmin, async (req, res) => {
    try {
        const dish = await Dish.findByPk(req.params.id);
        if (!dish) {
            return res.status(404).json({ message: 'Plat non trouvé' });
        }

        dish.is_available = !dish.is_available;
        await dish.save();

        res.json({
            message: `Le plat est maintenant ${dish.is_available ? 'disponible' : 'indisponible'}`,
            dish
        });
    } catch (error) {
        console.error('Toggle dish availability error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la disponibilité' });
    }
});

// Update dish (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { nom, prix, categorie, image_url, description, ingredients, is_popular, is_new, stock } = req.body;
        const dish = await Dish.findByPk(req.params.id);

        if (!dish) {
            return res.status(404).json({ message: 'Plat non trouvé' });
        }

        await dish.update({
            nom: nom || dish.nom,
            prix: prix ? parseFloat(prix) : dish.prix,
            categorie: categorie || dish.categorie,
            image_url: image_url || dish.image_url,
            description: description !== undefined ? description : dish.description,
            is_popular: is_popular !== undefined ? !!is_popular : dish.is_popular,
            is_new: is_new !== undefined ? !!is_new : dish.is_new,
            stock: stock !== undefined ? parseInt(stock) : dish.stock
        });

        if (ingredients !== undefined && Array.isArray(ingredients)) {
            // ingredients can be [id1, id2] or [{id: 1, is_extra: false}, ...]
            await dish.setIngredients([]); // Clear existing
            for (const ing of ingredients) {
                const ingId = typeof ing === 'object' ? ing.id : ing;
                const isExtra = typeof ing === 'object' ? !!ing.is_extra : false;
                await dish.addIngredient(ingId, { through: { is_extra: isExtra } });
            }
        }

        const updatedDish = await Dish.findByPk(dish.id, {
            include: [{ model: Ingredient, as: 'ingredients' }]
        });

        res.json({
            message: 'Plat mis à jour avec succès!',
            dish: updatedDish
        });
    } catch (error) {
        console.error('Update dish error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du plat' });
    }
});

// Delete dish (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const dish = await Dish.findByPk(req.params.id);

        if (!dish) {
            return res.status(404).json({ message: 'Plat non trouvé' });
        }

        await dish.destroy();

        res.json({ message: 'Plat supprimé avec succès!' });
    } catch (error) {
        console.error('Delete dish error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du plat' });
    }
});

export default router;
