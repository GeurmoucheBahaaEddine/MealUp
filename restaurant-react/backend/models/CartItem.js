import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    dish_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantite: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    customization: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
}, {
    tableName: 'cart_items',
    timestamps: false,
});

export default CartItem;
