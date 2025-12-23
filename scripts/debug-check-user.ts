
import { getDatabase } from '../src/lib/mongodb';
import { findUserByEmail } from '../src/lib/auth/userRepository';

async function checkUser() {
    console.log('Checking for admin user...');
    try {
        const user = await findUserByEmail('admin@glowglitch.com');
        if (user) {
            console.log('User found:');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Password Hash (first 20 chars):', user.password.substring(0, 20) + '...');
        } else {
            console.log('User admin@glowglitch.com NOT found.');
        }
    } catch (error) {
        console.error('Error checking user:', error);
    }
}

checkUser();
