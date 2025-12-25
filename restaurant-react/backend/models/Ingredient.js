import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Ingredient = sequelize.define('Ingredient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    prix: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    stock_actuel: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    unite: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'unité',
    },
    stock_alerte: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 5,
    }
}, {
    tableName: 'ingredients',
    timestamps: false,
});

export default Ingredient;
