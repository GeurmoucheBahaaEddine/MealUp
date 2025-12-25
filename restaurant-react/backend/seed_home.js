import { Dish } from './models/index.js';

async function seedHomeDishes() {
    try {
        const dishes = await Dish.findAll();
        console.log(`Found ${dishes.length} dishes.`);

        if (dishes.length === 0) {
            console.log('No dishes found to mark.');
            return;
        }

        // Mark the first 6 as popular
        for (let i = 0; i < Math.min(6, dishes.length); i++) {
            dishes[i].is_popular = true;
            await dishes[i].save();
            console.log(`Marked "${dishes[i].nom}" as popular.`);
        }

        // Mark the last 3 as new
        for (let i = Math.max(0, dishes.length - 3); i < dishes.length; i++) {
            dishes[i].is_new = true;
            await dishes[i].save();
            console.log(`Marked "${dishes[i].nom}" as new.`);
        }

        console.log('Done seeding Home page flags.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding flags:', error);
        process.exit(1);
    }
}

seedHomeDishes();
