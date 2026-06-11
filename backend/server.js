/**
 * ============================================================
 *  Simple Ecommerce Backend — Entry Point
 *  Author: SimpleEcommerce
 * ============================================================
 */

// ─── Load environment variables FIRST ────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

// ─── Internal Modules ─────────────────────────────────────────────────────────
const connectDB = require('./config/db');
const { seedAdmin } = require('./utils/dbSeeder');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ─── Initialize Express App ───────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middlewares ─────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded images
  })
);

// CORS — Allow all origins in development; restrict in production
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body Parser Middlewares ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files: Serve uploaded images ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SimpleEcommerce API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed admin user if not exists
    await seedAdmin();

    // Start listening
    app.listen(PORT, () => {
      console.log('\n══════════════════════════════════════════════════');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📁 Uploads dir:  http://localhost:${PORT}/uploads`);
      console.log(`🌍 Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log('══════════════════════════════════════════════════\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received (Ctrl+C). Shutting down...');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

startServer();

module.exports = app; // For testing
