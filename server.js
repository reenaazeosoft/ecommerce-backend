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
const adminProductRoute = require('./routes/adminProductRoute');
const sellerProductRoute = require('./routes/sellerProductRoute');
const publicRoute = require('./routes/publicRoute');
const customerCartRoute = require('./routes/customerCartRoute');
const customerOrderRoute = require('./routes/customerOrderRoute');
const sellerOrderRoute = require('./routes/sellerOrderRoute');
const customerPaymentRoute = require('./routes/customerPaymentRoute');


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
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/products', adminProductRoute);
// app.use('/api/products/review', productRoutes);

// seller apis Route
app.use('/api/seller', sellerRoutes);
app.use('/api/seller/products', sellerProductRoute);
app.use('/api/customer', customerRoutes);
app.use('/api/customer/cart', customerCartRoute);

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

// public routes 
app.use('/api/public', publicRoute);
app.use('/api/products', productRoutes);


// make orders
app.use('/api/customer/orders', customerOrderRoute);
app.use('/api/customer/payments', customerPaymentRoute);

//seller orders
app.use('/api/seller/orders', sellerOrderRoute);


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
