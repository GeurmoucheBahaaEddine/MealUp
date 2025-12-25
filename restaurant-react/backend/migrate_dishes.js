import sequelize from './config/database.js';
import { Dish } from './models/index.js';

const migrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection stable.');

        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Dishes');

        if (!tableInfo.is_available) {
            console.log('Adding is_available column...');
            await queryInterface.addColumn('Dishes', 'is_available', {
                type: 'BOOLEAN',
                defaultValue: true
            });
            console.log('Column added successfully.');
        } else {
            console.log('Column is_available already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
