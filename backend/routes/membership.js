const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('./activityLogs');

// POST: Create a new membership request (Public or User)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, preferred_location, message, tier } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and Email are required' });
        }

        const query = `
            INSERT INTO membership_requests (name, email, phone, preferred_location, message, tier)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [name, email, phone, preferred_location, message, tier || 'silver']);
        res.status(201).json({ success: true, message: 'Request submitted successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating membership request:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// GET: List all requests (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const query = 'SELECT * FROM membership_requests ORDER BY created_at DESC';
        const [results] = await db.query(query);
        res.json({ success: true, count: results.length, requests: results });
    } catch (err) {
        console.error('Error fetching requests:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// PUT: Update status (Admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['pending', 'approved', 'rejected', 'contacted'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Update request status
        const updateQuery = 'UPDATE membership_requests SET status = ? WHERE id = ?';
        await db.query(updateQuery, [status, id]);

        // If approved, update the user's membership tier
        if (status === 'approved') {
            const [requests] = await db.query('SELECT email, tier FROM membership_requests WHERE id = ?', [id]);

            if (requests.length > 0) {
                const { email, tier } = requests[0];
                const validTiers = ['classic', 'silver', 'gold', 'platinum'];
                const targetTier = validTiers.includes(tier?.toLowerCase()) ? tier.toLowerCase() : 'silver';

                console.log(`✨ Upgrading user ${email} to ${targetTier}...`);

                await db.query(
                    'UPDATE users SET membership_tier = ? WHERE email = ?',
                    [targetTier, email]
                );
            }
        }
        
        // Log the activity
        await logActivity(req.user.id, 'profile_update', `Membership request #${id} status changed to ${status}`, req);

        res.json({ success: true, message: 'Status updated successfully' });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// DELETE: Remove a request (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM membership_requests WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({ success: true, message: 'Request removed successfully' });
    } catch (err) {
        console.error('Error deleting request:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

module.exports = router;
