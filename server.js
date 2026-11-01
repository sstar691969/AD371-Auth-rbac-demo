require('dotenv').config();

const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Verify that a private session secret is configured
if (!process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET === 'replace_this_with_a_long_random_secret') {
    throw new Error('Please configure SESSION_SECRET in your .env file.');
}

// Security headers
app.use(helmet());

// Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure persistent login sessions
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.sqlite3',
        dir: path.join(__dirname, 'database')
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60
    }
}));

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Admin-only routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Basic server health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Authentication application server is running.'
    });
});

// Start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

// Export the app so automated tests can use it
module.exports = app;