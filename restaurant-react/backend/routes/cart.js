import express from 'express';
import { CartItem, Dish } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
    try {
        const cartItems = await CartItem.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Dish, as: 'dish' }],
        });

        const total = cartItems.reduce((sum, item) => {
            const basePrice = item.dish.prix;
            let extrasPrice = 0;

            // Handle new object-based customization or fallback to old array-based
            if (item.customization && !Array.isArray(item.customization) && item.customization.added) {
                extrasPrice = item.customization.added.reduce((eSum, extra) => eSum + (extra.prix || 0), 0);
            }

            return sum + ((basePrice + extrasPrice) * item.quantite);
        }, 0);

        res.json({ items: cartItems, total });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du panier' });
    }
});

// Add item to cart
router.post('/add/:dishId', authenticateToken, async (req, res) => {
    try {
        const dishId = parseInt(req.params.dishId);
        const { quantite = 1, customization = { removed: [], added: [] } } = req.body;

        const dish = await Dish.findByPk(dishId);
        if (!dish) {
            return res.status(404).json({ message: 'Plat non trouvé' });
        }

        // Check if item already in cart with EXACT same customization
        const existingItems = await CartItem.findAll({
            where: { user_id: req.user.id, dish_id: dishId },
        });

        // Robust comparison for customization
        const match = existingItems.find(item =>
            JSON.stringify(item.customization) === JSON.stringify(customization)
        );

        if (match) {
            match.quantite += quantite;
            await match.save();
        } else {
            await CartItem.create({
                user_id: req.user.id,
                dish_id: dishId,
                quantite,
                customization
            });
        }

        res.json({ message: `${quantite} x ${dish.nom} ajouté au panier!` });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout au panier' });
    }
});

// Remove item from cart
router.delete('/:itemId', authenticateToken, async (req, res) => {
    try {
        const item = await CartItem.findByPk(req.params.itemId);

        if (!item) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        if (item.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        await item.destroy();
        res.json({ message: 'Article supprimé du panier' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

// Update cart item quantity
router.put('/:itemId', authenticateToken, async (req, res) => {
    try {
        const item = await CartItem.findByPk(req.params.itemId);

        if (!item) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        if (item.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        item.quantite = parseInt(req.body.quantite);
        await item.save();

        res.json({ message: 'Quantité mise à jour', item });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
});

export default router;
