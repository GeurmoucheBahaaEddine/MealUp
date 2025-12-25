import sequelize from './config/database.js';
import { DataTypes } from 'sequelize';

const migrate = async () => {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Starting Migration: Dish Ingredient Type ---');

        // Check if is_extra column exists in dish_ingredients
        const dishIngredientsTable = await queryInterface.describeTable('dish_ingredients');
        if (!dishIngredientsTable.is_extra) {
            await queryInterface.addColumn('dish_ingredients', 'is_extra', {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
            console.log('✅ Column "is_extra" added to "dish_ingredients".');
        } else {
            console.log('ℹ️ Column "is_extra" already exists in "dish_ingredients".');
        }

        console.log('--- Migration Completed Successfully ---');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

migrate();
