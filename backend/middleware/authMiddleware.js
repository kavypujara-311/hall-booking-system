const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Verify the JWT signature first (no DB needed)
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // 2. Look up the user in DB
    try {
        const [users] = await db.query(
            'SELECT id, role, email, name, profile_image, membership_tier, is_active FROM users WHERE id = ?',
            [decoded.id]
        );
        if (!users || users.length === 0) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        req.user = users[0];
        next();
    } catch (dbErr) {
        console.error('Auth DB error:', dbErr.message);
        // Return 503 (Service Unavailable) not 401 — this is a DB issue, not a bad token
        return res.status(503).json({ success: false, message: 'Database temporarily unavailable, please retry' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
};

module.exports = { verifyToken, isAdmin };
