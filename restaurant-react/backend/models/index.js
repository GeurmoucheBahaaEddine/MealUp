import User from './User.js';
import Dish from './Dish.js';
import CartItem from './CartItem.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Favorite from './Favorite.js';
import ActivityLog from './ActivityLog.js';
import Review from './Review.js';
import PromoCode from './PromoCode.js';
import Ingredient from './Ingredient.js';
import DishIngredient from './DishIngredient.js';

// Define relationships
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'client' });

User.hasMany(CartItem, { foreignKey: 'user_id', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

Dish.hasMany(CartItem, { foreignKey: 'dish_id', as: 'cartItems' });
CartItem.belongsTo(Dish, { foreignKey: 'dish_id', as: 'dish' });

Dish.hasMany(Favorite, { foreignKey: 'dish_id', as: 'favorites' });
Favorite.belongsTo(Dish, { foreignKey: 'dish_id', as: 'dish' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Dish.hasMany(OrderItem, { foreignKey: 'dish_id' });
OrderItem.belongsTo(Dish, { foreignKey: 'dish_id' });

// Review Associations
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Dish.hasMany(Review, { foreignKey: 'dish_id', as: 'reviews' });
Review.belongsTo(Dish, { foreignKey: 'dish_id', as: 'dish' });

// ActivityLog relationships
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ActivityLog, { foreignKey: 'user_id' });

// Ingredient Associations (Many-to-Many through explicit join model)
Dish.belongsToMany(Ingredient, { through: DishIngredient, as: 'ingredients', foreignKey: 'dish_id' });
Ingredient.belongsToMany(Dish, { through: DishIngredient, as: 'dishes', foreignKey: 'ingredient_id' });

export {
    User,
    Dish,
    CartItem,
    Order,
    OrderItem,
    Favorite,
    ActivityLog,
    Review,
    PromoCode,
    Ingredient,
    DishIngredient
};
