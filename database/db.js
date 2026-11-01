
const Database = require('better-sqlite3');
const path = require('path');

// Create or open the SQLite database
const dbPath = path.join(__dirname, 'app.db');
const db = new Database(dbPath);

// Improve database reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create the users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'User'
            CHECK (role IN ('User', 'Admin')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`);

// Find a user by email
function findUserByEmail(email) {
    return db.prepare(`
        SELECT * FROM users WHERE email = ?
    `).get(email);
}

// Find a user by ID
function findUserById(id) {
    return db.prepare(`
        SELECT id, email, role, created_at
        FROM users
        WHERE id = ?
    `).get(id);
}

// Create a new user
function createUser(email, passwordHash, role = 'User') {
    const result = db.prepare(`
        INSERT INTO users (email, password_hash, role)
        VALUES (?, ?, ?)
    `).run(email, passwordHash, role);

    return findUserById(result.lastInsertRowid);
}

// List users without exposing password hashes
function getAllUsers() {
    return db.prepare(`
        SELECT id, email, role, created_at
        FROM users
        ORDER BY id
    `).all();
}

module.exports = {
    db,
    findUserByEmail,
    findUserById,
    createUser,
    getAllUsers
};