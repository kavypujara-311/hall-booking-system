const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all bookings
router.get('/', async (req, res) => {
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

// Get single booking
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
            special_requests
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

        const addonsString = addons ? JSON.stringify(addons) : '[]';
        // Note: We are storing addons in 'special_requests' for now as a JSON string if no dedicated column exists, 
        // OR we should ideally alter the table. Let's assume we use the 'special_requests' for extra data or create a column.
        // For this step, I will modify schema.sql in next step. Here I will include it in the query.
        // Let's check schema again. It has 'special_requests TEXT'.
        // I'll add 'addons' to the query assuming I will update the DB schema shortly.

        const booking_id = 'BK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const [result] = await db.query(
            `INSERT INTO bookings (booking_id, user_id, hall_id, booking_date, start_time, end_time, total_amount, guests, event_type, status, special_requests, addons) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`,
            [booking_id, user_id, hall_id, booking_date, start_time, end_time, total_amount, guests, event_type, special_requests, addonsString]
        );

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: result.insertId,
                user_id,
                hall_id,
                booking_date,
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
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
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
router.delete('/:id', async (req, res) => {
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
