const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../config/db');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy - only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const [existingUsers] = await db.query(
                'SELECT * FROM users WHERE google_id = ?',
                [profile.id]
            );

            if (existingUsers.length > 0) {
                return done(null, existingUsers[0]);
            }

            const [emailUsers] = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [profile.emails[0].value]
            );

            if (emailUsers.length > 0) {
                await db.query(
                    'UPDATE users SET google_id = ?, auth_provider = ?, profile_image = ?, email_verified = true WHERE id = ?',
                    [profile.id, 'google', profile.photos[0]?.value, emailUsers[0].id]
                );
                const [updatedUser] = await db.query('SELECT * FROM users WHERE id = ?', [emailUsers[0].id]);
                return done(null, updatedUser[0]);
            }

            const [result] = await db.query(
                `INSERT INTO users (name, email, google_id, auth_provider, profile_image, email_verified, role) 
                 VALUES (?, ?, ?, 'google', ?, true, 'user')`,
                [profile.displayName, profile.emails[0].value, profile.id, profile.photos[0]?.value]
            );

            const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            done(null, newUser[0]);
        } catch (error) {
            done(error, null);
        }
    }));
    console.log('✅ Google OAuth configured');
} else {
    console.log('⚠️ Google OAuth not configured (missing GOOGLE_CLIENT_ID)');
}

module.exports = passport;
