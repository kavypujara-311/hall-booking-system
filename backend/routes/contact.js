const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Use current database connection
console.log("Contact route initialized.");

// POST: Submit a contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, Email and Message are required' });
        }

        const query = `
            INSERT INTO contact_submissions (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [name, email, subject || 'General Inquiry', message]);
        res.status(201).json({
            success: true,
            message: 'Message sent successfully. We will contact you soon.',
            id: result.insertId
        });
    } catch (err) {
        console.error('Error submitting contact form:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

module.exports = router;
