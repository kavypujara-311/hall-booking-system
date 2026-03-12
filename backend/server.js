const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// Routes Import
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

// 1. SIMPLEST POSSIBLE HEALTH CHECK (Pre-middleware to avoid crashes)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// 2. MIDDLEWARE
app.use(cors({
    origin: true, // Allow all origins during debug
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. SESSION & PASSPORT
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

// 4. API ROUTES
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

// 5. STATIC FILES (Frontend)
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
}

// 6. CATCH-ALL (Frontend Routing)
// Using Regex for Express 5 compatibility to avoid "Missing parameter name" error
app.get(/^(?!\/api).+/, (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: 'Frontend not found', path: indexPath });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});
