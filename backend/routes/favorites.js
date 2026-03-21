const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all favorites for the logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [favorites] = await db.query(
            `SELECT h.*, f.id as favorite_id, f.created_at as favorited_at 
             FROM favorites f 
             INNER JOIN halls h ON f.hall_id = h.id 
             WHERE f.user_id = ?`,
            [userId]
        );
        res.json({ success: true, favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add a hall to favorites
router.post('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { hall_id } = req.body;

        if (!hall_id) {
            return res.status(400).json({ success: false, message: 'Hall ID is required' });
        }

        // Check if already favorite
        const [existing] = await db.query(
            'SELECT * FROM favorites WHERE user_id = ? AND hall_id = ?',
            [userId, hall_id]
        );

        if (existing.length > 0) {
            return res.json({ success: true, message: 'Already in favorites' });
        }

        await db.query(
            'INSERT INTO favorites (user_id, hall_id) VALUES (?, ?)',
            [userId, hall_id]
        );

        res.json({ success: true, message: 'Added to favorites' });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Remove a hall from favorites
router.delete('/:hallId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { hallId } = req.params;

        await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND hall_id = ?',
            [userId, hallId]
        );

        res.json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
