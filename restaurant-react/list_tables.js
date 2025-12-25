import sequelize from './backend/config/database.js';

async function listTables() {
    try {
        const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
        console.log("Database Tables:");
        console.table(tables);
        process.exit(0);
    } catch (error) {
        console.error("Error listing tables:", error);
        process.exit(1);
    }
}

listTables();
