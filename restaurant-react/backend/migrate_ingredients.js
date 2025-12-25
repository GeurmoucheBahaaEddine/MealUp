import sequelize from './config/database.js';
import { DataTypes } from 'sequelize';

const migrate = async () => {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Starting Migration: Ingredients & Customizations ---');

        // 1. Create ingredients table if not exists
        await queryInterface.createTable('ingredients', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            nom: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            }
        });
        console.log('✅ Table "ingredients" created/verified.');

        // 2. Create dish_ingredients join table
        await queryInterface.createTable('dish_ingredients', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            dish_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'dishes', key: 'id' },
                onDelete: 'CASCADE',
            },
            ingredient_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'ingredients', key: 'id' },
                onDelete: 'CASCADE',
            }
        });
        console.log('✅ Table "dish_ingredients" created/verified.');

        // 3. Add customization column to cart_items
        const cartItemsTable = await queryInterface.describeTable('cart_items');
        if (!cartItemsTable.customization) {
            await queryInterface.addColumn('cart_items', 'customization', {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
            });
            console.log('✅ Column "customization" added to "cart_items".');
        }

        // 4. Add customization column to order_items
        const orderItemsTable = await queryInterface.describeTable('order_items');
        if (!orderItemsTable.customization) {
            await queryInterface.addColumn('order_items', 'customization', {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
            });
            console.log('✅ Column "customization" added to "order_items".');
        }

        console.log('--- Migration Completed Successfully ---');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sequelize.close();
    }
};

migrate();
