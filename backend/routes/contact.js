const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create the table properly if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

// Use promise-based query execution to ensure table exists
db.query(createTableQuery)
    .then(() => console.log("Contact submissions table checked/created."))
    .catch((err) => console.error("Error creating contact_submissions table:", err));

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
