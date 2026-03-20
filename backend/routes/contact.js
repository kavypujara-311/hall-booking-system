const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Create the table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'responded') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

db.query(createTableQuery)
    .then(() => console.log("Contact submissions table checked/created."))
    .catch((err) => console.error("Error creating contact_submissions table:", err));

// POST: Submit a contact form (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Name, Email and Message are required' });
        }
        const [result] = await db.query(
            'INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject || 'General Inquiry', message]
        );
        res.status(201).json({ success: true, message: 'Message sent successfully.', id: result.insertId });
    } catch (err) {
        console.error('Error submitting contact form:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// GET: Fetch all contact submissions (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM contact_submissions ORDER BY created_at DESC'
        );
        res.json({ success: true, submissions: rows });
    } catch (err) {
        console.error('Error fetching contact submissions:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// PATCH: Update status (admin only)
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['new', 'read', 'responded'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        await db.query('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

module.exports = router;
