const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create the table properly if it doesn't exist
// Create the table properly if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS membership_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    preferred_location VARCHAR(255),
    message TEXT,
    tier VARCHAR(50),
    status ENUM('pending', 'approved', 'rejected', 'contacted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

// Use promise-based query execution
db.query(createTableQuery)
    .then(() => {
        console.log("Membership requests table checked/created.");
        // Try to add the column if it doesn't exist (primitive migration)
        const alterQuery = "ALTER TABLE membership_requests ADD COLUMN tier VARCHAR(50)";
        return db.query(alterQuery).catch(() => {
            // Ignore error if column already exists
        });
    })
    .catch((err) => console.error("Error creating/updating membership_requests table:", err));

// POST: Create a new membership request
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, preferred_location, message, tier } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and Email are required' });
        }

        const query = `
            INSERT INTO membership_requests (name, email, phone, preferred_location, message, tier)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [name, email, phone, preferred_location, message, tier]);
        res.status(201).json({ message: 'Request submitted successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating membership request:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET: List all requests
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM membership_requests ORDER BY created_at DESC';
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching requests:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT: Update status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // Update request status
        const updateQuery = 'UPDATE membership_requests SET status = ? WHERE id = ?';
        await db.query(updateQuery, [status, id]);

        // If approved, update the user's membership tier
        if (status === 'approved') {
            // 1. Get request details (to find email and tier)
            const [requests] = await db.query('SELECT email, tier FROM membership_requests WHERE id = ?', [id]);

            if (requests.length > 0) {
                const { email, tier } = requests[0];
                const validTiers = ['silver', 'gold', 'platinum'];
                const targetTier = validTiers.includes(tier?.toLowerCase()) ? tier.toLowerCase() : 'silver'; // Default to silver if undefined

                console.log(`✨ Upgrading user ${email} to ${targetTier}...`);

                // 2. Update users table
                const [userRes] = await db.query(
                    'UPDATE users SET membership_tier = ? WHERE email = ?',
                    [targetTier, email]
                );

                if (userRes.affectedRows > 0) {
                    console.log('✅ User membership updated successfully.');
                } else {
                    console.log('⚠️ User not found for membership upgrade (email mismatch or no account).');
                }
            }
        }

        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
