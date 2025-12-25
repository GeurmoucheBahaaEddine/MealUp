import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.post('/auth/change-password', data),
};

// Dishes API
export const dishesAPI = {
    getAll: (params) => api.get('/dishes', { params }),
    getPopular: () => api.get('/dishes/popular'),
    getNew: () => api.get('/dishes/new'),
    getOne: (id) => api.get(`/dishes/${id}`),
    createDish: (data) => api.post('/dishes', data),
    updateDish: (id, data) => api.put(`/dishes/${id}`, data),
    deleteDish: (id) => api.delete(`/dishes/${id}`),
    toggleAvailability: (id) => api.put(`/dishes/${id}/toggle-availability`),
};

// Cart API
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (dishId, quantite, customization = []) => api.post(`/cart/add/${dishId}`, { quantite, customization }),
    removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
    updateQuantity: (itemId, quantite) => api.put(`/cart/${itemId}`, { quantite }),
};

// Orders API
export const ordersAPI = {
    getMyOrders: () => api.get('/orders'),
    confirmOrder: (data) => api.post('/orders/confirm', data),
    getMyStats: () => api.get('/orders/stats/me'),
};

// Favorites API
export const favoritesAPI = {
    getFavorites: () => api.get('/favorites'),
    addFavorite: (dishId) => api.post(`/favorites/add/${dishId}`),
    removeFavorite: (dishId) => api.delete(`/favorites/remove/${dishId}`),
};

// Admin API
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getSalesAnalytics: (period = '7days') => api.get(`/admin/analytics/sales?period=${period}`),
    getTopDishes: () => api.get('/admin/analytics/top-dishes'),
    getCategoryAnalytics: () => api.get('/admin/analytics/categories'),
    getHourlyAnalytics: () => api.get('/admin/analytics/hourly'),
    getCustomerAnalytics: () => api.get('/admin/analytics/customers'),
    getRecentOrders: (limit = 10) => api.get(`/admin/recent-orders?limit=${limit}`),
    getAllOrders: (params) => api.get('/admin/orders', { params }),
    updateOrderStatus: (orderId, status) => api.put(`/admin/orders/${orderId}/status`, { status }),
    // User Management
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
    updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),
    getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
    // Promo Codes
    getPromoCodes: () => api.get('/promocodes'),
    createPromoCode: (data) => api.post('/promocodes', data),
    deletePromoCode: (id) => api.delete(`/promocodes/${id}`),
};

// Reviews API
export const reviewsAPI = {
    getByDish: (dishId) => api.get(`/reviews/dish/${dishId}`),
    addReview: (dishId, data) => api.post(`/reviews/dish/${dishId}`, data),
};

// Ingredients API
export const ingredientsAPI = {
    getAll: () => api.get('/ingredients'),
    getLowStock: () => api.get('/ingredients/low-stock'),
    create: (data) => api.post('/ingredients', data),
    update: (id, data) => api.put(`/ingredients/${id}`, data),
    delete: (id) => api.delete(`/ingredients/${id}`),
};

// Activity Log API
// Promo Codes API
export const promoCodesAPI = {
    validate: (code, amount) => api.post('/promocodes/validate', { code, amount }),
};

export const logsAPI = {
    getLogs: (params) => api.get('/activity-log', { params }),
    getActions: () => api.get('/activity-log/actions'),
};

export default api;
