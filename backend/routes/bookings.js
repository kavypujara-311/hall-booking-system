const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('./activityLogs');


// Get all bookings (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { user_id, hall_id, status } = req.query;

        let query = `
            SELECT b.*, h.name as hall_name, h.location, u.name as user_name, u.email, u.phone
            FROM bookings b
            JOIN halls h ON b.hall_id = h.id
            JOIN users u ON b.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (user_id) {
            query += ' AND b.user_id = ?';
            params.push(user_id);
        }

        if (hall_id) {
            query += ' AND b.hall_id = ?';
            params.push(hall_id);
        }

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.created_at DESC';

        const [bookings] = await db.query(query, params);

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings'
        });
    }
});

// Get user's own bookings
router.get('/user', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [bookings] = await db.query(
            `SELECT b.*, h.name as hall_name, h.location, u.name as user_name, u.email, u.phone
             FROM bookings b
             JOIN halls h ON b.hall_id = h.id
             JOIN users u ON b.user_id = u.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [userId]
        );
        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your bookings'
        });
    }
});

// Get single booking
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.*, h.name as hall_name, h.location, u.name as user_name, u.email, u.phone
             FROM bookings b
             JOIN halls h ON b.hall_id = h.id
             JOIN users u ON b.user_id = u.id
             WHERE b.id = ?`,
            [req.params.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking: bookings[0]
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking'
        });
    }
});

// Create booking
router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            user_id,
            hall_id,
            booking_date,
            start_time,
            end_time,
            total_amount,
            guests,
            event_type,
            addons,
            special_requests,
            payment_method
        } = req.body;

        if (!user_id || !hall_id || !booking_date || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if hall is available
        const [conflicts] = await db.query(
            `SELECT * FROM bookings 
             WHERE hall_id = ? 
             AND booking_date = ? 
             AND status != 'cancelled'
             AND (
                 (start_time <= ? AND end_time > ?) OR
                 (start_time < ? AND end_time >= ?) OR
                 (start_time >= ? AND end_time <= ?)
             )`,
            [hall_id, booking_date, start_time, start_time, end_time, end_time, start_time, end_time]
        );

        if (conflicts.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Hall is not available for the selected time slot'
            });
        }

        const addonsString = Array.isArray(addons) ? JSON.stringify(addons) : (addons || '[]');
        const booking_id = 'BK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        // Calculate hours duration
        const start = new Date(`${booking_date}T${start_time}`);
        const end = new Date(`${booking_date}T${end_time}`);
        let hours = Math.ceil((end - start) / (1000 * 60 * 60));
        if (isNaN(hours) || hours <= 0) hours = 1;

        const [result] = await db.query(
            `INSERT INTO bookings (booking_id, user_id, hall_id, booking_date, start_time, end_time, hours, total_amount, guests, event_type, status, special_requests, addons, payment_method) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)`,
            [booking_id, user_id, hall_id, booking_date, start_time, end_time, hours, total_amount, guests, event_type, special_requests, addonsString, payment_method || 'Card']
        );

        // Log activity
        await logActivity(user_id, 'booking_created', `New booking created: ${booking_id}`, req);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: result.insertId,
                booking_id,
                user_id,
                hall_id,
                booking_date,
                start_time,
                end_time,
                total_amount,
                status: 'confirmed'
            }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking'
        });
    }
});

// Update booking status
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const [result] = await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking status updated successfully'
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating booking'
        });
    }
});

// Delete booking
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM bookings WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting booking'
        });
    }
});

module.exports = router;
