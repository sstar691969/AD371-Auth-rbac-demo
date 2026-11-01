
const { findUserById } = require('../database/db');

// Check whether the person is logged in
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            error: 'Authentication required. Please log in.'
        });
    }

    const user = findUserById(req.session.userId);

    if (!user) {
        return res.status(401).json({
            error: 'User account not found.'
        });
    }

    // Attach the verified database user to the request
    req.user = user;

    next();
}

// Check whether the logged-in person has the required role
function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required.'
            });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                error: 'Access denied. You do not have permission.'
            });
        }

        next();
    };
}

module.exports = {
    requireAuth,
    requireRole
};