import sequelize from './config/database.js';
import { User } from './models/index.js';
import bcrypt from 'bcryptjs';

const testPassword = async () => {
    try {
        const user = await User.findOne({ where: { email: 'admin@example.com' } });
        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        const isValid = await user.checkPassword('admin123');
        console.log('Is password "admin123" valid?', isValid);

        const manualCheck = await bcrypt.compare('admin123', user.password_hash);
        console.log('Manual bcrypt check:', manualCheck);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing password:', error);
        process.exit(1);
    }
};

testPassword();
