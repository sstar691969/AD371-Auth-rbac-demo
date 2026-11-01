
require('dotenv').config();

const bcrypt = require('bcrypt');
const readline = require('readline');
const { createUser, findUserByEmail } = require('./database/db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createAdmin() {
    try {
        const email = await new Promise(resolve => {
            rl.question('Enter Admin email: ', resolve);
        });

        const password = await new Promise(resolve => {
            rl.question('Enter Admin password (minimum 12 characters): ', resolve);
        });

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            throw new Error('Please enter a valid email address.');
        }

        if (
            Buffer.byteLength(password, 'utf8') < 12 ||
            Buffer.byteLength(password, 'utf8') > 72
        ) {
            throw new Error('Password must be between 12 and 72 bytes.');
        }

        if (findUserByEmail(normalizedEmail)) {
            throw new Error('An account with this email already exists.');
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const admin = createUser(normalizedEmail, passwordHash, 'Admin');

        console.log('Admin account created successfully.');
        console.log('Admin ID:', admin.id);
        console.log('Admin email:', admin.email);
        console.log('Admin role:', admin.role);

    } catch (error) {
        console.error('Admin creation failed:', error.message);
        process.exitCode = 1;
    } finally {
        rl.close();
        require('./database/db').db.close();
    }
}

createAdmin();