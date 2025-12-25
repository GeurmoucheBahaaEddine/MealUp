import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import { User, Dish, CartItem, Order, OrderItem, Favorite } from './models/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import dishRoutes from './routes/dishes.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import favoriteRoutes from './routes/favorites.js';
import adminRoutes from './routes/admin.js';
import activityLogRoutes from './routes/activityLog.js';
import reviewRoutes from './routes/reviews.js';
import promoCodeRoutes from './routes/promoCodes.js';
import ingredientRoutes from './routes/ingredients.js';
import { logActivity } from './middleware/activityLogger.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io to request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket.IO Connection Logic
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('joinRoom', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Client ${socket.id} joined room user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Log all write operations automatically
app.use((req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && !req.path.startsWith('/api/auth')) {
        return logActivity(req.method, 'API')(req, res, next);
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promocodes', promoCodeRoutes);
app.use('/api/ingredients', ingredientRoutes);


// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Restaurant API is running' });
});


// Global Error Handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({
        message: 'Une erreur serveur est survenue localement',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Initialize database and start server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync all models
        await sequelize.sync();
        console.log('✅ Database models synchronized.');

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
            console.log(`🔌 Socket.IO is running`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();
