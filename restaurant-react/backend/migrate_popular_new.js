import sequelize from './config/database.js';
import { DataTypes } from 'sequelize';

const migrate = async () => {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Starting Migration: Popular and New Flags ---');

        const dishesTable = await queryInterface.describeTable('dishes');

        if (!dishesTable.is_popular) {
            await queryInterface.addColumn('dishes', 'is_popular', {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
            console.log('✅ Column "is_popular" added to "dishes".');
        } else {
            console.log('ℹ️ Column "is_popular" already exists in "dishes".');
        }

        if (!dishesTable.is_new) {
            await queryInterface.addColumn('dishes', 'is_new', {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
            console.log('✅ Column "is_new" added to "dishes".');
        } else {
            console.log('ℹ️ Column "is_new" already exists in "dishes".');
        }

        console.log('--- Migration Completed Successfully ---');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

migrate();
