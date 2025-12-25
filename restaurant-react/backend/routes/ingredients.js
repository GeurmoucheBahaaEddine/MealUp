import express from 'express';
import { Ingredient } from '../models/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all ingredients
router.get('/', async (req, res) => {
    try {
        const ingredients = await Ingredient.findAll({
            order: [['nom', 'ASC']]
        });
        res.json(ingredients);
    } catch (error) {
        console.error('Get ingredients error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des ingrédients' });
    }
});

// Get low stock ingredients
router.get('/low-stock', authenticateToken, isAdmin, async (req, res) => {
    try {
        const ingredients = await Ingredient.findAll({
            where: sequelize.where(
                sequelize.col('stock_actuel'),
                { [Op.lte]: sequelize.col('stock_alerte') }
            ),
            order: [['stock_actuel', 'ASC']]
        });
        res.json(ingredients);
    } catch (error) {
        console.error('Get low stock ingredients error:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des alertes de stock',
            error: error.message
        });
    }
});

// Add new ingredient (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { nom, prix = 0, stock_actuel = 0, unite = 'unité', stock_alerte = 5 } = req.body;
        if (!nom) {
            return res.status(400).json({ message: 'Le nom de l\'ingrédient est requis' });
        }

        const ingredient = await Ingredient.create({
            nom,
            prix: parseFloat(prix),
            stock_actuel: parseFloat(stock_actuel),
            unite,
            stock_alerte: parseFloat(stock_alerte)
        });
        res.status(201).json(ingredient);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Cet ingrédient existe déjà' });
        }
        console.error('Add ingredient error:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'ingrédient' });
    }
});

// Update ingredient (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { nom, prix, stock_actuel, unite, stock_alerte } = req.body;
        const ingredient = await Ingredient.findByPk(req.params.id);

        if (!ingredient) {
            return res.status(404).json({ message: 'Ingrédient non trouvé' });
        }

        ingredient.nom = nom !== undefined ? nom : ingredient.nom;
        ingredient.prix = prix !== undefined ? parseFloat(prix) : ingredient.prix;
        ingredient.stock_actuel = stock_actuel !== undefined ? parseFloat(stock_actuel) : ingredient.stock_actuel;
        ingredient.unite = unite !== undefined ? unite : ingredient.unite;
        ingredient.stock_alerte = stock_alerte !== undefined ? parseFloat(stock_alerte) : ingredient.stock_alerte;

        await ingredient.save();
        res.json(ingredient);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Un autre ingrédient porte déjà ce nom' });
        }
        console.error('Update ingredient error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'ingrédient' });
    }
});

// Delete ingredient (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const ingredient = await Ingredient.findByPk(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ message: 'Ingrédient non trouvé' });
        }

        // Check if ingredient is used in any dishes
        const usageCount = await ingredient.countDishes();
        if (usageCount > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer cet ingrédient car il est utilisé dans ${usageCount} plat(s). Retirez-le d'abord des plats correspondants.`
            });
        }

        await ingredient.destroy();
        res.json({ message: 'Ingrédient supprimé avec succès' });
    } catch (error) {
        console.error('Delete ingredient error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'ingrédient' });
    }
});

export default router;
