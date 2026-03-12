const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();

// ========== 1. CORS ==========
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== 2. STATIC FILES ==========
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== 3. SESSION & PASSPORT ==========
const passport = require('./config/passport');
app.use('/api', session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use('/api', passport.initialize());
app.use('/api', passport.session());

// ========== 4. HEALTH CHECK ==========
app.get('/api/health', async (req, res) => {
    try {
        const db = require('./config/db');
        await db.query('SELECT 1');
        res.json({
            status: 'ok',
            message: 'Hall Booking API is running and Database is Connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Database Connection Failed',
            error: err.message
        });
    }
});

// ========== 5. API ROUTES ==========
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

// ========== 6. ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// ========== 7. FRONTEND CATCH-ALL (Express 5 compatible) ==========
// Using app.use() instead of app.get('*') because Express 5 removed wildcard path support
app.use((req, res) => {
    // API routes that weren't matched
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API route not found: ' + req.path });
    }
    // Serve frontend for all other routes (React Router)
    const indexFile = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.status(404).send('Frontend not built. Run: npm run build');
    }
});

// ========== 8. START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
