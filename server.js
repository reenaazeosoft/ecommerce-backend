// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { initRedis } = require('./config/redis');

// Routes
const adminRoutes = require('./routes/admin');
const sellerRoutes = require('./routes/seller');
const customerRoutes = require('./routes/customer');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// ==================== Security & Middlewares ====================
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));

// Basic rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// ==================== Routes ====================
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', categoryRoutes);
app.use('/api/seller/products', productRoutes);

// ==================== Global Error Handler ====================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    statusFlag: 0,
    errorCode: err.status || 500,
    message: err.message || 'Internal Server Error',
    data: [],
  });
});

// ==================== Startup Sequence ====================
(async () => {
  try {
    // 1️⃣ Connect MongoDB
    await mongoose.connect(config.db.uri);
    console.log('✅ MongoDB connected');

    // 2️⃣ Initialize Redis
    await initRedis();
    console.log('✅ Redis initialized');

    // 3️⃣ Start server only after both are ready
    const PORT = config.port || process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${config.env} mode`);
    });
  } catch (err) {
    console.error('❌ Startup Error:', err.message);
    process.exit(1);
  }
})();
