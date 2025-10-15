const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { addProduct } = require('../controllers/productController');

const router = express.Router();

// 🗂️ Multer Configuration for File Uploads
const storage = multer.diskStorage({
  // Destination folder for product images
  destination: (req, file, cb) => {
    cb(null, 'uploads/products');
  },
  // Unique file name: timestamp + extension
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// 🔍 File Upload Filters and Limits
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB per image
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// 🛒 POST /api/seller/products
// Description: Add a new product (seller only)
router.post(
  '/products',
  auth, // 🔐 Requires seller login (JWT)
  upload.array('images', 5), // 🖼️ Allow up to 5 images
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be >= 0'),
    body('categoryId').notEmpty().withMessage('Category ID is required')
  ],
  addProduct
);

module.exports = router;
