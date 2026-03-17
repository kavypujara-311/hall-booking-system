const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [users] = await db.query(
            'SELECT id, role, email, name, profile_image, membership_tier, is_active FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
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
