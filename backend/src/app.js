const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./middlewares/errorHandler');
const { authLimiter, apiLimiter, paymentLimiter } = require('./middlewares/rateLimit');

// Routes
const authRoutes = require('./routes/authRoutes');
const universityRoutes = require('./routes/universityRoutes');
const canteenRoutes = require('./routes/canteenRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global API rate limiter
app.use(apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes with specific limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentLimiter, paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
