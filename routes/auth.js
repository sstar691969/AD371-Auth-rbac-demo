
const express = require('express');
const bcrypt = require('bcrypt');
const {
    findUserByEmail,
    findUserById,
    createUser
} = require('../database/db');

const router = express.Router();

// Register a new regular user
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            password.length < 8 ||
            Buffer.byteLength(password, 'utf8') > 72
        ) {
            return res.status(400).json({
                error: 'Enter a valid email and a password between 8 and 72 bytes.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (findUserByEmail(normalizedEmail)) {
            return res.status(409).json({
                error: 'An account with that email already exists.'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Public registration always creates a User, never an Admin.
        const user = createUser(normalizedEmail, passwordHash, 'User');

        return res.status(201).json({
            message: 'Account created successfully.',
            user
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            error: 'Unable to complete registration.'
        });
    }
});

// Log in
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({
                error: 'Email and password are required.'
            });
        }

        const user = findUserByEmail(email.trim().toLowerCase());

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        // Regenerate the session to help prevent session fixation.
        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({
                    error: 'Unable to create login session.'
                });
            }

            req.session.userId = user.id;

            req.session.save((saveError) => {
                if (saveError) {
                    return res.status(500).json({
                        error: 'Unable to save login session.'
                    });
                }

                return res.json({
                    message: 'Login successful.',
                    user: findUserById(user.id)
                });
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Unable to complete login.'
        });
    }
});

// Check the current login session
router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: 'You are not logged in.'
        });
    }

    const user = findUserById(req.session.userId);

    if (!user) {
        return res.status(401).json({
            error: 'Your account could not be found.'
        });
    }

    return res.json({ user });
});

// Log out
router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                error: 'Unable to log out.'
            });
        }

        res.clearCookie('connect.sid');

        return res.json({
            message: 'Logout successful.'
        });
    });
});

module.exports = router;