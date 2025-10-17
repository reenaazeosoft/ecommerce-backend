/**
 * Description: Public Routes (No Authentication)
 * Base Path: /api/public
 */

const express = require('express');
const router = express.Router();
const { getAllCategories, getAllProducts,getProductsByCategory } = require('../controllers/publicController');
const { query,param } = require('express-validator');

/**
 * Description: GET /api/public/categories
 * Purpose: Fetch all categories
 */
router.get('/categories', getAllCategories);

/**
 * Description: GET /api/public/products
 * Purpose: Fetch all products with filters
 */
router.get(
  '/products',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('categoryId').optional().isMongoId().withMessage('Invalid category ID'),
  ],
  getAllProducts
);

/**
 * Description: GET /api/public/categories/:id/products
 * Purpose: Fetch all products for a given category
 */
router.get(
  '/categories/:id/products',
  [
    param('id').isMongoId().withMessage('Invalid category ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 }),
    query('search').optional().isString(),
  ],
  getProductsByCategory
);

module.exports = router;
