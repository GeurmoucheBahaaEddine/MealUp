import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DishIngredient = sequelize.define('DishIngredient', {
    dish_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'dishes',
            key: 'id'
        }
    },
    ingredient_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'ingredients',
            key: 'id'
        }
    },
    is_extra: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'dish_ingredients',
    timestamps: false,
});

export default DishIngredient;
