import sequelize from './backend/config/database.js';

async function checkSchema() {
    try {
        const [ordersSchema] = await sequelize.query("PRAGMA table_info(orders)");
        console.log("Orders Table Schema:");
        console.table(ordersSchema);

        const [orderItemsSchema] = await sequelize.query("PRAGMA table_info(order_items)");
        console.log("\nOrder Items Table Schema:");
        console.table(orderItemsSchema);

        process.exit(0);
    } catch (error) {
        console.error("Error checking schema:", error);
        process.exit(1);
    }
}

checkSchema();
