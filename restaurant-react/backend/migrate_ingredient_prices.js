import sequelize from './config/database.js';
import { DataTypes } from 'sequelize';

const migrate = async () => {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Starting Migration: Ingredient Prices ---');

        // Check if prix column exists in ingredients
        const ingredientsTable = await queryInterface.describeTable('ingredients');
        if (!ingredientsTable.prix) {
            await queryInterface.addColumn('ingredients', 'prix', {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
            });
            console.log('✅ Column "prix" added to "ingredients".');
        } else {
            console.log('ℹ️ Column "prix" already exists in "ingredients".');
        }

        console.log('--- Migration Completed Successfully ---');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

migrate();
