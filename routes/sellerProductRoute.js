/**
 * Description: Seller Product Routes
 * Base path: /api/seller/products
 */

const express = require('express');
const router = express.Router();
const { addProduct, getAllSellerProducts ,  updateProduct,
  deleteProduct,updateProductStock,bulkUploadProducts  } = require('../controllers/sellerProductController');
const authSeller = require('../middleware/authSeller');
const multer = require('multer');
const path = require('path');
const { body, query ,param} = require('express-validator');

// 🗂️ Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/products'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

/**
 * Description: POST /api/seller/products (Auth: Seller)
 * Purpose: Add a new product for authenticated seller.
 */
router.post(
  '/',
  authSeller,
  upload.array('images', 5),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be >= 0'),
    body('categoryId').notEmpty().withMessage('Category ID is required'),
  ],
  addProduct
);

/**
 * Description: GET /api/seller/products (Auth: Seller)
 * Purpose: Get seller’s products with pagination and filters.
 */
router.get(
  '/',
  authSeller,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('status').optional().isString().trim(),
  ],
  getAllSellerProducts
);


// Update product
router.put(
  '/:id',
  authSeller,
  upload.array('images', 5),
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('categoryId').optional().isMongoId().withMessage('Invalid category ID'),
  ],
  updateProduct
);

// Delete product
router.delete(
  '/:id',
  authSeller,
  [param('id').isMongoId().withMessage('Invalid product ID')],
  deleteProduct
);



// ✅ Update product stock
router.put(
  '/:id/stock',
  authSeller,
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('stock')
      .notEmpty()
      .withMessage('Stock value is required')
      .isInt({ min: 0 })
      .withMessage('Stock must be a positive integer'),
  ],
  updateProductStock
);

// Multer for CSV/XLSX uploads
const uploadBulk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/bulk'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only CSV or XLSX files are allowed'));
    cb(null, true);
  },
});

// 📦 Bulk Upload Route
router.post(
  '/bulk-upload',
  authSeller,
  uploadBulk.single('file'),
  bulkUploadProducts
);
module.exports = router;
