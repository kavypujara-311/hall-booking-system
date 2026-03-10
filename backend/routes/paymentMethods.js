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

// Get all payment methods for user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const [methods] = await db.execute(
            'SELECT * FROM payment_methods WHERE user_id = ? AND is_active = true ORDER BY is_primary DESC, created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            paymentMethods: methods
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add new payment method
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { method_type, card_number, card_holder_name, card_expiry, card_type, upi_id, is_primary } = req.body;

        // If setting as primary, unset other primary methods
        if (is_primary) {
            await db.execute(
                'UPDATE payment_methods SET is_primary = false WHERE user_id = ?',
                [userId]
            );
        }

        const [result] = await db.execute(
            `INSERT INTO payment_methods (user_id, method_type, card_number, card_holder_name, card_expiry, card_type, upi_id, is_primary) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, method_type, card_number, card_holder_name, card_expiry, card_type, upi_id, is_primary || false]
        );

        res.json({
            success: true,
            message: 'Payment method added successfully',
            paymentMethodId: result.insertId
        });
    } catch (error) {
        console.error('Error adding payment method:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update payment method
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const methodId = req.params.id;
        const { card_holder_name, card_expiry, upi_id, is_primary } = req.body;

        // Verify ownership
        const [existing] = await db.execute(
            'SELECT * FROM payment_methods WHERE id = ? AND user_id = ?',
            [methodId, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }

        // If setting as primary, unset other primary methods
        if (is_primary) {
            await db.execute(
                'UPDATE payment_methods SET is_primary = false WHERE user_id = ?',
                [userId]
            );
        }

        await db.execute(
            'UPDATE payment_methods SET card_holder_name = ?, card_expiry = ?, upi_id = ?, is_primary = ? WHERE id = ? AND user_id = ?',
            [card_holder_name, card_expiry, upi_id, is_primary || false, methodId, userId]
        );

        res.json({ success: true, message: 'Payment method updated successfully' });
    } catch (error) {
        console.error('Error updating payment method:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete payment method
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const methodId = req.params.id;

        // Soft delete
        await db.execute(
            'UPDATE payment_methods SET is_active = false WHERE id = ? AND user_id = ?',
            [methodId, userId]
        );

        res.json({ success: true, message: 'Payment method deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Set primary payment method
router.patch('/:id/primary', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const methodId = req.params.id;

        // Unset all primary
        await db.execute(
            'UPDATE payment_methods SET is_primary = false WHERE user_id = ?',
            [userId]
        );

        // Set this as primary
        await db.execute(
            'UPDATE payment_methods SET is_primary = true WHERE id = ? AND user_id = ?',
            [methodId, userId]
        );

        res.json({ success: true, message: 'Primary payment method updated' });
    } catch (error) {
        console.error('Error setting primary payment method:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
