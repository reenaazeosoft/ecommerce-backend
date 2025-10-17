/**
 * Description: Admin Product Routes
 * Base path: /api/admin/products
 */

const express = require('express');
const router = express.Router();
const { getAllProducts ,getProductById,deleteProduct } = require('../controllers/adminProductController');
const authAdmin = require('../middleware/auth'); // already exists
const { query,param  } = require('express-validator');

/**
 * Description: GET /api/admin/products (Auth: Admin)
 * Purpose: Retrieve all products with pagination and filters.
 */
router.get(
  '/',
  authAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Invalid categoryId format (must be MongoID)')
  ],
  getAllProducts
);


/**
 * Description: GET /api/admin/products/:id (Auth: Admin)
 * Purpose: Retrieve a single product by its ID.
 */
router.get(
  '/:id',
  authAdmin,
  [param('id').isMongoId().withMessage('Invalid product ID')],
  getProductById
);
/**
 * Description: DELETE /api/admin/products/:id (Auth: Admin)
 * Purpose: Permanently delete a product by ID.
 */
router.delete(
  '/:id',
  authAdmin,
  [param('id').isMongoId().withMessage('Invalid product ID')],
  deleteProduct
);

module.exports = router;
