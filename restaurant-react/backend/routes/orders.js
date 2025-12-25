import express from 'express';
import { Order, OrderItem, CartItem, Dish, PromoCode, Ingredient } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op, fn, col } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

// Get personal statistics
router.get('/stats/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Basic Stats (Total Spent, Total Orders)
        const allOrders = await Order.findAll({
            where: { user_id: userId },
            attributes: ['total', 'date_commande', 'statut'],
            order: [['date_commande', 'DESC']]
        });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const stats = {
            totalSpentLifetime: 0,
            totalSpentMonth: 0,
            totalSpentWeek: 0,
            totalOrders: allOrders.length,
            lastOrderStatus: allOrders.length > 0 ? allOrders[0].statut : 'Aucune',
            mostOrderedDish: null,
            cartItemCount: 0
        };

        allOrders.forEach(order => {
            const orderDate = new Date(order.date_commande);
            stats.totalSpentLifetime += order.total;
            if (orderDate >= startOfMonth) stats.totalSpentMonth += order.total;
            if (orderDate >= startOfWeek) stats.totalSpentWeek += order.total;
        });

        // 2. Most Ordered Dish
        const topDishes = await OrderItem.findAll({
            attributes: [
                'dish_id',
                'plat_nom',
                [fn('COUNT', col('dish_id')), 'count']
            ],
            include: [{
                model: Order,
                where: { user_id: userId },
                attributes: []
            }],
            group: ['dish_id', 'plat_nom'],
            order: [[col('count'), 'DESC']],
            limit: 1
        });

        if (topDishes.length > 0) {
            stats.mostOrderedDish = {
                nom: topDishes[0].plat_nom,
                count: parseInt(topDishes[0].getDataValue('count'))
            };
        }

        // 3. Current Cart Count
        stats.cartItemCount = await CartItem.count({ where: { user_id: userId } });

        res.json(stats);
    } catch (error) {
        console.error('Get my stats error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
});

// Get user's orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.user.id },
            include: [{ model: OrderItem, as: 'items' }],
            order: [['date_commande', 'DESC']],
        });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
});

// Create order from cart
router.post('/confirm', authenticateToken, async (req, res) => {
    try {
        // Get cart items
        const cartItems = await CartItem.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Dish, as: 'dish' }],
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Votre panier est vide!' });
        }

        // --- VERIFICATION PRELIMINAIRE DES STOCKS ---
        for (const item of cartItems) {
            const dishWithIngs = await Dish.findByPk(item.dish_id, {
                include: [{ model: Ingredient, as: 'ingredients' }]
            });

            if (dishWithIngs && dishWithIngs.ingredients) {
                const removedNames = (item.customization?.removed || []).map(n => n.toLowerCase());
                const addedNames = (item.customization?.added || []).map(a => (a.nom || a).toLowerCase());

                // Check standard ingredients
                for (const ingredient of dishWithIngs.ingredients) {
                    if (removedNames.includes(ingredient.nom.toLowerCase())) continue;
                    if (ingredient.stock_actuel <= 0 && !ingredient.DishIngredient?.is_extra) {
                        return res.status(400).json({
                            message: `Désolé, l'ingrédient "${ingredient.nom}" est en rupture de stock pour le plat "${item.dish.nom}".`
                        });
                    }
                }

                // Check added extras
                for (const extraName of addedNames) {
                    const extraIng = await Ingredient.findOne({
                        where: sequelize.where(sequelize.fn('LOWER', sequelize.col('nom')), extraName)
                    });
                    if (extraIng && extraIng.stock_actuel <= 0) {
                        return res.status(400).json({
                            message: `Désolé, le supplément "${extraName}" est en rupture de stock.`
                        });
                    }
                }
            }
        }

        // Calculate total including extras
        let total = cartItems.reduce((sum, item) => {
            if (!item.dish) {
                console.warn(`Dish not found for cart item ${item.id}`);
                return sum;
            }
            const basePrice = item.dish.prix || 0;
            let extrasPrice = 0;
            if (item.customization && !Array.isArray(item.customization) && item.customization.added) {
                extrasPrice = item.customization.added.reduce((eSum, extra) => eSum + (extra.prix || 0), 0);
            }
            return sum + ((basePrice + extrasPrice) * item.quantite);
        }, 0);

        // Apply promo code if present
        const { promoCode } = req.body;
        if (promoCode) {
            console.log('Validating promo code:', promoCode);
            const promo = await PromoCode.findOne({
                where: { code: promoCode, active: true }
            });

            if (promo) {
                if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
                    // Expired, ignore
                } else if (total >= promo.min_order_amount) {
                    let discount = 0;
                    if (promo.discount_type === 'percentage') {
                        discount = (total * promo.discount_value) / 100;
                    } else {
                        discount = promo.discount_value;
                    }
                    total = Math.max(0, total - discount);

                    // Increment usage
                    await promo.increment('current_uses');
                }
            }
        }

        // Create order
        const order = await Order.create({
            user_id: req.user.id,
            total,
        });

        // Create order items and reduce stock
        for (const item of cartItems) {
            const basePrice = item.dish.prix;
            let extrasPrice = 0;
            if (item.customization && !Array.isArray(item.customization) && item.customization.added) {
                extrasPrice = item.customization.added.reduce((eSum, extra) => eSum + (extra.prix || 0), 0);
            }

            await OrderItem.create({
                order_id: order.id,
                dish_id: item.dish_id,
                plat_nom: item.dish.nom,
                plat_prix: basePrice + extrasPrice,
                quantite: item.quantite,
                customization: item.customization || { removed: [], added: [] }
            });

            // --- REDUCTION DES STOCKS ---
            try {
                // On récupère les ingrédients de base du plat
                const dishWithIngredients = await Dish.findByPk(item.dish_id, {
                    include: [{ model: Ingredient, as: 'ingredients' }]
                });

                if (dishWithIngredients && dishWithIngredients.ingredients) {
                    const removedNames = (item.customization?.removed || []).map(n => n.toLowerCase());
                    const addedNames = (item.customization?.added || []).map(a => (a.nom || a).toLowerCase());

                    for (const ingredient of dishWithIngredients.ingredients) {
                        const ingName = ingredient.nom.toLowerCase();
                        const isExtra = ingredient.DishIngredient?.is_extra;

                        if (isExtra) {
                            // C'est un supplément lié : on ne réduit que s'il est ajouté
                            if (addedNames.includes(ingName)) {
                                await ingredient.decrement('stock_actuel', { by: item.quantite });
                            }
                        } else {
                            // C'est un ingrédient de base : on réduit sauf s'il est retiré
                            if (!removedNames.includes(ingName)) {
                                await ingredient.decrement('stock_actuel', { by: item.quantite });
                            }
                        }
                    }

                    // On réduit aussi les ingrédients ajoutés qui ne sont pas liés statiquement au plat
                    const linkedIngredientNames = dishWithIngredients.ingredients.map(i => i.nom.toLowerCase());
                    for (const extraName of addedNames) {
                        if (!linkedIngredientNames.includes(extraName)) {
                            const extraIng = await Ingredient.findOne({
                                where: sequelize.where(
                                    sequelize.fn('LOWER', sequelize.col('nom')),
                                    extraName
                                )
                            });
                            if (extraIng) {
                                await extraIng.decrement('stock_actuel', { by: item.quantite });
                            }
                        }
                    }
                }
            } catch (stockError) {
                console.error(`Erreur réduction stock pour plat ${item.dish_id}:`, stockError);
            }
        }

        // Clear cart
        await CartItem.destroy({ where: { user_id: req.user.id } });

        // Notify Admins via Socket.IO
        req.io.emit('newOrder', {
            ...order.toJSON(),
            items: cartItems // Include items for immediate display
        });

        res.json({
            message: `Commande #${order.id} confirmée! Total: ${total.toLocaleString()} DA`,
            order,
        });
    } catch (error) {
        console.error('Confirm order error FULL:', error);
        res.status(500).json({
            message: 'Erreur lors de la confirmation de la commande',
            error: error.message,
            stack: error.stack
        });
    }
});

export default router;
