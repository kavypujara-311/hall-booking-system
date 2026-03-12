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

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health checks (Moved to TOP to ensure discovery)
app.get('/api/health', async (req, res) => {
    try {
        const db = require('./config/db');
        await db.query('SELECT 1');
        res.json({
            status: 'ok',
            message: 'Hall Booking API is running and Database is Connected',
            timestamp: new Date().toISOString(),
            env: { NODE_ENV: process.env.NODE_ENV }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Database Connection Failed', error: err.message });
    }
});

app.get('/test-server', (req, res) => {
    res.json({ message: 'Server is reachable', time: new Date().toISOString() });
});

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (like Postman)
        if (!origin) return callback(null, true);

        // Allow any localhost or 127.0.0.1
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
        }

        // Allow any onrender.com domain
        if (origin.endsWith('.onrender.com') || origin === 'https://onrender.com') {
            return callback(null, true);
        }

        // Allow explicit FRONTEND_URL
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }

        // Fallback: Check if origin matches the current host (for same-origin)
        return callback(null, true); // Allow all for now to debug, will restrict later if needed
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend in production VERY EARLY so assets don't fail due to DB errors 
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Session middleware (required for Passport) scoped to API routes
app.use('/api', session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport scoped to API routes
app.use('/api', passport.initialize());
app.use('/api', passport.session());

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message,
        code: err.code
    });
});

// API 404 Handler (Catch unmatched /api routes)
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Serve frontend catch-all in production for anything else
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        const publicPath = path.join(__dirname, 'public', 'index.html');
        res.sendFile(publicPath, (err) => {
            if (err) {
                // If index.html is missing, return a clean error instead of hanging
                res.status(404).json({ 
                    error: "Frontend not built or index.html missing",
                    path: publicPath 
                });
            }
        });
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth Methods:`);
    console.log(`   ✅ Email/Password`);

    console.log(`   ${process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌'} Phone OTP`);
});
