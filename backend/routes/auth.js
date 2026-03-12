const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const db = require('../config/db');
const { generateOTP, sendOTP } = require('../services/sms');
const { logActivity } = require('./activityLogs');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ==================== EMAIL/PASSWORD REGISTRATION ====================
router.post('/register', async (req, res) => {
    try {
        console.log('Register request received:', req.body);
        const { name, email, phone, password, role } = req.body;

        if (!name || !email || !password || !phone) {
            console.log('Missing fields:', { hasName: !!name, hasEmail: !!email, hasPassword: !!password, hasPhone: !!phone });
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (Name, Email, Phone, Password)'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user exists (by email OR phone)
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE email = ? OR phone = ?',
            [normalizedEmail, phone]
        );

        if (existingUsers.length > 0) {
            const msg = existingUsers[0].email === normalizedEmail ? 'User already exists with this email' : 'User already exists with this phone number';
            console.log('Registration failed:', msg);
            return res.status(400).json({
                success: false,
                message: msg
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, phone, password, role, auth_provider) VALUES (?, ?, ?, ?, ?, ?)',
            [name, normalizedEmail, phone, hashedPassword, role || 'user', 'local']
        );

        await logActivity(result.insertId, 'profile_update', 'User registered', req);

        const token = generateToken({
            id: result.insertId,
            email: normalizedEmail,
            phone,
            role: role || 'user'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: result.insertId,
                name,
                email: normalizedEmail,
                role: role || 'user',
                auth_provider: 'local'
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// ==================== EMAIL/PASSWORD LOGIN ====================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (users.length === 0) {
            console.log('Login failed: User not found for email:', normalizedEmail);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Check if user registered with Google
        if (user.auth_provider === 'google' && !user.password) {
            console.log('Login failed: User is google auth only');
            return res.status(401).json({
                success: false,
                message: 'Please sign in with Google'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Login failed: Password mismatch for user:', normalizedEmail);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user);

        console.log('Login successful for user:', user.email);
        await logActivity(user.id, 'login', 'User logged in', req);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                membership_tier: user.membership_tier,
                auth_provider: user.auth_provider,
                profile_image: user.profile_image
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// ==================== GOOGLE OAUTH ====================
// Initiate Google OAuth
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

// Google OAuth Callback
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    }),
    (req, res) => {
        try {
            const token = generateToken(req.user);

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google`);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
    }
);

// ==================== PHONE OTP AUTHENTICATION ====================
// Send OTP to phone
router.post('/phone/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide phone number'
            });
        }

        // Validate phone format (basic validation)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format. Use international format (e.g., +919876543210)'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Check if user exists with this phone
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );

        if (existingUsers.length > 0) {
            // Update existing user's OTP
            await db.query(
                'UPDATE users SET otp_code = ?, otp_expires_at = ?, otp_verified = false WHERE phone = ?',
                [otp, expiresAt, phone]
            );
        } else {
            // Create temporary user record
            await db.query(
                'INSERT INTO users (name, phone, otp_code, otp_expires_at, auth_provider, role) VALUES (?, ?, ?, ?, ?, ?)',
                ['Guest User', phone, otp, expiresAt, 'phone', 'user']
            );
        }

        // Log OTP attempt
        await db.query(
            'INSERT INTO otp_logs (phone, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)',
            [phone, otp, 'login', expiresAt]
        );

        // Send OTP via SMS
        const smsResult = await sendOTP(phone, otp);

        // If Twilio not configured, still return success in development
        if (!smsResult.success && smsResult.devMode) {
            return res.json({
                success: true,
                message: 'OTP generated (SMS not configured)',
                expiresIn: 600,
                devMode: true,
                otp: smsResult.otp, // Only in development
                note: 'Twilio not configured. Check console for OTP or add Twilio credentials to .env'
            });
        }

        if (!smsResult.success) {
            return res.status(500).json({
                success: false,
                message: smsResult.error || 'Failed to send OTP. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'OTP sent successfully',
            expiresIn: 600 // seconds
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending OTP'
        });
    }
});

// Verify OTP and login/register
router.post('/phone/verify-otp', async (req, res) => {
    try {
        const { phone, otp, name } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide phone number and OTP'
            });
        }

        // Get user with this phone
        const [users] = await db.query(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Phone number not found. Please request OTP first.'
            });
        }

        const user = users[0];

        // Check if OTP expired
        if (new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Verify OTP
        if (user.otp_code !== otp) {
            // Log failed attempt
            await db.query(
                'UPDATE otp_logs SET attempts = attempts + 1, status = ? WHERE phone = ? AND otp_code = ?',
                ['failed', phone, otp]
            );

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.'
            });
        }

        // OTP is valid - update user
        const updateData = {
            otp_verified: true,
            phone_verified: true,
            is_active: true
        };

        // If name provided and user doesn't have name, update it
        if (name && !user.name) {
            updateData.name = name;
        }

        await db.query(
            'UPDATE users SET otp_verified = ?, phone_verified = ?, is_active = ?, name = COALESCE(?, name) WHERE id = ?',
            [true, true, true, name, user.id]
        );

        // Log successful verification
        await db.query(
            'UPDATE otp_logs SET status = ?, verified_at = NOW() WHERE phone = ? AND otp_code = ?',
            ['verified', phone, otp]
        );

        // Get updated user
        const [updatedUsers] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
        const updatedUser = updatedUsers[0];

        const token = generateToken(updatedUser);

        res.json({
            success: true,
            message: 'Phone verified successfully',
            token,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                phone: updatedUser.phone,
                role: updatedUser.role,
                auth_provider: 'phone',
                phone_verified: true
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while verifying OTP'
        });
    }
});

// ==================== GET CURRENT USER ====================
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [users] = await db.query(
            'SELECT id, name, email, phone, role, auth_provider, profile_image, phone_verified, email_verified, created_at FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// ==================== UPDATE PROFILE ====================
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { name, email, phone, location, bio, social_links } = req.body;

        // Construct update query dynamically
        const updates = [];
        const values = [];

        if (name !== undefined) { updates.push('name = ?'); values.push(name); }
        if (email !== undefined) { updates.push('email = ?'); values.push(email); }
        if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
        if (location !== undefined) { updates.push('location = ?'); values.push(location); }
        if (bio !== undefined) { updates.push('bio = ?'); values.push(bio); }
        if (social_links !== undefined) { updates.push('social_links = ?'); values.push(JSON.stringify(social_links)); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        values.push(userId);

        await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

        // Fetch updated user
        const [users] = await db.query(
            'SELECT id, name, email, phone, role, auth_provider, profile_image, location, bio, social_links, phone_verified, email_verified FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: users[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
});

module.exports = router;
