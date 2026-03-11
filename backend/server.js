const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const hallRoutes = require('./routes/halls');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const favoritesRoutes = require('./routes/favorites');
const paymentMethodRoutes = require('./routes/paymentMethods');
const { router: activityLogsRoutes } = require('./routes/activityLogs');
const membershipRoutes = require('./routes/membership');
const contactRoutes = require('./routes/contact');
const reviewsRoutes = require('./routes/reviews');

const app = express();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (like Postman)
        if (!origin) return callback(null, true);

        // Allow any localhost origin for development convenience
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
        }

        const allowed = [process.env.FRONTEND_URL].filter(Boolean);
        if (allowed.includes(origin)) return callback(null, true);

        return callback(new Error(`CORS blocked from origin ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Session middleware (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/activity-logs', activityLogsRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Hall Booking API is running',
        timestamp: new Date().toISOString(),
        features: {
            emailAuth: true,
            googleOAuth: !!process.env.GOOGLE_CLIENT_ID,
            phoneOTP: !!process.env.TWILIO_ACCOUNT_SID
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Serve frontend in production
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth Methods:`);
    console.log(`   ✅ Email/Password`);

    console.log(`   ${process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌'} Phone OTP`);
});
