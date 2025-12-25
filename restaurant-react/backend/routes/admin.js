import express from 'express';
import { User, Dish, Order, OrderItem } from '../models/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, isAdmin);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            totalDishes,
            totalOrders,
            totalRevenue,
        ] = await Promise.all([
            User.count(),
            Dish.count(),
            Order.count(),
            Order.sum('total'),
        ]);

        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todayOrders, todayRevenue] = await Promise.all([
            Order.count({
                where: {
                    date_commande: {
                        [Op.gte]: today,
                    },
                },
            }),
            Order.sum('total', {
                where: {
                    date_commande: {
                        [Op.gte]: today,
                    },
                },
            }),
        ]);

        res.json({
            totalUsers,
            totalDishes,
            totalOrders,
            totalRevenue: totalRevenue || 0,
            todayOrders,
            todayRevenue: todayRevenue || 0,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
});

// Get sales analytics for charts
router.get('/analytics/sales', async (req, res) => {
    try {
        const { period = '7days' } = req.query;

        let startDate = new Date();
        if (period === '7days') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === '30days') {
            startDate.setDate(startDate.getDate() - 30);
        } else if (period === '12months') {
            startDate.setMonth(startDate.getMonth() - 12);
        }

        const orders = await Order.findAll({
            where: {
                date_commande: {
                    [Op.gte]: startDate,
                },
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date_commande')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
            ],
            group: [sequelize.fn('DATE', sequelize.col('date_commande'))],
            order: [[sequelize.fn('DATE', sequelize.col('date_commande')), 'ASC']],
            raw: true,
        });

        res.json(orders);
    } catch (error) {
        console.error('Get sales analytics error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des analyses' });
    }
});

// Get top dishes
router.get('/analytics/top-dishes', async (req, res) => {
    try {
        const topDishes = await OrderItem.findAll({
            attributes: [
                ['dish_id', 'plat_id'],
                'plat_nom',
                [sequelize.fn('SUM', sequelize.col('quantite')), 'total_sold'],
                [sequelize.fn('SUM', sequelize.literal('plat_prix * quantite')), 'total_revenue'],
            ],
            group: ['dish_id', 'plat_nom'],
            order: [[sequelize.literal('total_sold'), 'DESC']],
            limit: 10,
            raw: true,
        });

        res.json(topDishes);
    } catch (error) {
        console.error('Get top dishes error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des plats populaires' });
    }
});

// Get analytics by Category
router.get('/analytics/categories', async (req, res) => {
    try {
        const stats = await OrderItem.findAll({
            attributes: [
                [sequelize.col('Dish.categorie'), 'category'],
                [sequelize.fn('SUM', sequelize.col('quantite')), 'total_sold'],
                [sequelize.fn('SUM', sequelize.literal('plat_prix * quantite')), 'revenue'],
            ],
            include: [{
                model: Dish,
                attributes: []
            }],
            group: ['Dish.categorie'],
            raw: true
        });
        res.json(stats);
    } catch (error) {
        console.error('Get category analytics error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques par catégorie' });
    }
});

// Get hourly order trends
router.get('/analytics/hourly', async (req, res) => {
    try {
        const trends = await Order.findAll({
            attributes: [
                [sequelize.fn('strftime', '%H', sequelize.col('date_commande')), 'hour'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
            ],
            group: [sequelize.fn('strftime', '%H', sequelize.col('date_commande'))],
            order: [[sequelize.literal('hour'), 'ASC']],
            raw: true
        });
        res.json(trends);
    } catch (error) {
        console.error('Get hourly trends error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tendances horaires' });
    }
});

// Get top customers
router.get('/analytics/customers', async (req, res) => {
    try {
        const topCustomers = await Order.findAll({
            attributes: [
                'user_id',
                [sequelize.fn('COUNT', sequelize.col('Order.id')), 'order_count'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total_spent'],
            ],
            include: [{
                model: User,
                as: 'client',
                attributes: ['nom', 'email']
            }],
            group: ['user_id', 'client.id'],
            order: [[sequelize.literal('total_spent'), 'DESC']],
            limit: 5,
            raw: true,
            nest: true
        });
        res.json(topCustomers);
    } catch (error) {
        console.error('Get top customers error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des meilleurs clients' });
    }
});

// Get recent orders
router.get('/recent-orders', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const recentOrders = await Order.findAll({
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'nom', 'email'],
                },
                {
                    model: OrderItem,
                    as: 'items',
                },
            ],
            order: [['date_commande', 'DESC']],
            limit: parseInt(limit),
        });

        res.json(recentOrders);
    } catch (error) {
        console.error('Get recent orders error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes récentes' });
    }
});

// Get all orders for admin management
router.get('/orders', async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status && status !== 'all') {
            where.statut = status;
        }

        if (search) {
            where[Op.or] = [
                { '$client.nom$': { [Op.like]: `%${search}%` } },
                { '$client.email$': { [Op.like]: `%${search}%` } },
            ];

            // If search is a number, also search by Order ID
            if (!isNaN(search)) {
                where[Op.or].push({ id: parseInt(search) });
            }
        }

        const orders = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'nom', 'email'],
                },
                {
                    model: OrderItem,
                    as: 'items',
                },
            ],
            order: [['date_commande', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            orders: orders.rows,
            total: orders.count,
            page: parseInt(page),
            totalPages: Math.ceil(orders.count / limit),
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        order.statut = status;
        await order.save();

        // Notify User via Socket.IO
        req.io.to(`user_${order.user_id}`).emit('orderStatusUpdated', {
            orderId: order.id,
            status: status
        });

        res.json({ message: 'Statut mis à jour', order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
});

// --- User Management ---

// Get all users
router.get('/users', async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { nom: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { adresse: { [Op.like]: `%${search}%` } },
            ];
        }

        const users = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password_hash'] },
            order: [['date_inscription', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            users: users.rows,
            total: users.count,
            page: parseInt(page),
            totalPages: Math.ceil(users.count / limit),
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        user.role = role;
        await user.save();

        res.json({ message: 'Rôle mis à jour', user });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
    }
});

// Toggle user status
router.put('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        user.status = status;
        await user.save();

        res.json({ message: 'Statut mis à jour', user });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
});

// Get user detail with history
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] },
            include: [
                {
                    model: Order,
                    as: 'orders',
                    limit: 10,
                    order: [['date_commande', 'DESC']],
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des détails' });
    }
});

export default router;
