
import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(process.cwd(), '.env.local') });
config();

import { findUserByEmail, createUser } from '../src/lib/auth/userRepository';
import { verifyPassword, hashPassword } from '../src/lib/auth/password';

async function check() {
    console.log('--- Password Verification Debug ---');
    const email = 'admin@glowglitch.com';
    const inputPwd = 'AdminPassword123!';

    let user = await findUserByEmail(email);
    if (!user) {
        console.log(`User ${email} NOT found in DB. Creating now...`);
        try {
            await createUser({
                email,
                password: inputPwd,
                role: 'admin',
                name: 'Glow Admin'
            });
            console.log('User created successfully.');
            user = await findUserByEmail(email);
        } catch (e) {
            console.error('Failed to create user:', e);
            return;
        }
    }

    if (!user) {
        console.error('Still cannot find user after creation attempt.');
        return;
    }

    console.log(`User found: ${user._id}`);
    console.log(`Stored Hash: ${user.password}`);

    const isValid = await verifyPassword(inputPwd, user.password);
    console.log(`Password verification result: ${isValid}`);
}

check();
