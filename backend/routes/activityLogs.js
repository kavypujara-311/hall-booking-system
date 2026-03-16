const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is authenticated
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Log user activity
const logActivity = async (userId, activityType, description, req) => {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');
        const deviceInfo = getDeviceInfo(userAgent);

        await db.execute(
            `INSERT INTO user_activity_logs (user_id, activity_type, activity_description, ip_address, user_agent, device_info) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, activityType, description, ipAddress, userAgent, deviceInfo]
        );
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// Helper function to extract device info from user agent
const getDeviceInfo = (userAgent) => {
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS Device';

    return 'Unknown Device';
};

// Get recent activity for user
// Get recent activity
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const limitParam = parseInt(req.query.limit, 10);
        const limit = (!isNaN(limitParam) && limitParam > 0) ? limitParam : 20;

        let query;
        let params;

        if (userRole === 'admin') {
            // Admin sees all activity
            query = `
                SELECT l.*, u.name as user_name, u.email as user_email 
                FROM user_activity_logs l
                LEFT JOIN users u ON l.user_id = u.id
                ORDER BY l.created_at DESC 
                LIMIT ${limit}
            `;
            params = [];
        } else {
            // User sees only their own activity
            query = `
                SELECT * FROM user_activity_logs 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ${limit}
            `;
            params = [userId];
        }

        const [activities] = await db.execute(query, params);

        res.json({
            success: true,
            activities: activities
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create activity log (can be called from other routes)
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { activity_type, activity_description } = req.body;

        await logActivity(userId, activity_type, activity_description, req);

        res.json({
            success: true,
            message: 'Activity logged successfully'
        });
    } catch (error) {
        console.error('Error creating activity log:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete old activity logs (cleanup - can be called periodically)
router.delete('/cleanup', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const daysToKeep = req.query.days || 90;

        await db.execute(
            `DELETE FROM user_activity_logs 
             WHERE user_id = ? 
             AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [userId, parseInt(daysToKeep)]
        );

        res.json({
            success: true,
            message: 'Old activity logs cleaned up'
        });
    } catch (error) {
        console.error('Error cleaning up activity logs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = { router, logActivity };
