const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Helper: Recalculate hall rating & total_reviews from actual reviews
const updateHallRatingStats = async (hall_id) => {
    const [stats] = await db.query(
        'SELECT COUNT(*) as total, COALESCE(AVG(rating), 0) as avg_rating FROM reviews WHERE hall_id = ?',
        [hall_id]
    );
    const { total, avg_rating } = stats[0];
    await db.query(
        'UPDATE halls SET rating = ?, total_reviews = ? WHERE id = ?',
        [parseFloat(Number(avg_rating).toFixed(2)), total, hall_id]
    );
};

// Get all reviews for a specific hall
router.get('/:hall_id', async (req, res) => {
    try {
        const { hall_id } = req.params;
        const query = `
            SELECT r.*, u.name as user_name, u.profile_image 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.hall_id = ? 
            ORDER BY r.created_at DESC
        `;
        const [reviews] = await db.query(query, [hall_id]);
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a review
router.post('/', verifyToken, async (req, res) => {
    try {
        const { hall_id, rating, comment } = req.body;
        const user_id = req.user.id;

        if (!hall_id || !rating) {
            return res.status(400).json({ message: 'Hall ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if user has already reviewed this hall
        const [existing] = await db.query('SELECT * FROM reviews WHERE user_id = ? AND hall_id = ?', [user_id, hall_id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this venue' });
        }

        const query = `
            INSERT INTO reviews (user_id, hall_id, rating, comment) 
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [user_id, hall_id, rating, comment]);

        // Update hall's aggregate rating & review count
        await updateHallRatingStats(hall_id);

        // Fetch the created review to return it
        const [newReview] = await db.query(`
            SELECT r.*, u.name as user_name, u.profile_image 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        `, [result.insertId]);

        res.status(201).json(newReview[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error ' + err.message });
    }
});

// Delete a review (owner only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const [review] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
        if (review.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only the review owner or admin can delete
        if (review[0].user_id !== user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const hall_id = review[0].hall_id;
        await db.query('DELETE FROM reviews WHERE id = ?', [id]);

        // Re-calculate hall stats
        await updateHallRatingStats(hall_id);

        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error ' + err.message });
    }
});

module.exports = router;

