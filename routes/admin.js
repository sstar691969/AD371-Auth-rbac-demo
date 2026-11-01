
const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getAllUsers } = require('../database/db');

const router = express.Router();

// Only logged-in Admins can view the user list
router.get(
    '/users',
    requireAuth,
    requireRole('Admin'),
    (req, res) => {
        res.json({
            message: 'Admin access granted.',
            users: getAllUsers()
        });
    }
);

module.exports = router;