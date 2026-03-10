const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
    try {
        // Check for token in Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists
        const [users] = await db.execute(
            'SELECT id, role, email FROM users WHERE id = ?',
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

module.exports = { verifyToken };
