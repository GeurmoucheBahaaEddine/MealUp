import sequelize from './config/database.js';
import { User } from './models/index.js';

const checkUser = async () => {
    try {
        const user = await User.findOne({ where: { email: 'admin@example.com' } });
        if (user) {
            console.log('✅ User found:', user.email);
            console.log('ID:', user.id);
            console.log('Role:', user.role);
        } else {
            console.log('❌ User NOT found in database.');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking user:', error);
        process.exit(1);
    }
};

checkUser();
