const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const upload = require('../config/multer');
const { logActivity } = require('./activityLogs');

const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const isAuthenticated = verifyToken;


// Get all users (Admin only)
router.get('/', isAuthenticated, async (req, res) => {
    try {
        if (req.user.role && req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
        }

        const [users] = await db.execute(
            'SELECT id, name, email, phone, role, location, bio, profile_image, created_at, is_active FROM users ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get current user profile
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await db.execute(
            'SELECT id, name, email, phone, role, membership_tier, location, bio, profile_image, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user profile
router.put('/me', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`Updating profile for user ${userId}. Body:`, req.body);
        const { name, email, phone, location, bio, social_links } = req.body;

        // Convert social_links object to JSON string if provided
        const socialLinksJson = social_links ? JSON.stringify(social_links) : null;

        const [result] = await db.execute(
            'UPDATE users SET name = ?, email = ?, phone = ?, location = ?, bio = ?, social_links = ? WHERE id = ?',
            [name, email, phone, location, bio, socialLinksJson, userId]
        );
        console.log('Update result:', result);

        // Log activity
        await logActivity(userId, 'profile_update', `Updated profile information`, req);

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Upload profile photo
router.post('/me/photo', isAuthenticated, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const userId = req.user.id;
        const photoPath = `/uploads/profiles/${req.file.filename}`;

        // Update user's profile_image in database
        await db.execute(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [photoPath, userId]
        );

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photoUrl: photoPath
        });

        // Log activity
        await logActivity(userId, 'photo_uploaded', 'Updated profile photo', req);
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Change password
router.put('/change-password', isAuthenticated, async (req, res) => {
    console.log('Change password request body:', req.body);
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        // Get current password hash
        const [users] = await db.execute(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        // Log activity
        await logActivity(userId, 'password_changed', 'Password changed successfully', req);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete user (Admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
        }

        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

module.exports = router;
