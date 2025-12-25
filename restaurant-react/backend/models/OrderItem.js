import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    dish_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    plat_nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    plat_prix: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    customization: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
}, {
    tableName: 'order_items',
    timestamps: false,
});

export default OrderItem;
