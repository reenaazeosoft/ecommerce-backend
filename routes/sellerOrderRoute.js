const express = require('express');
const router = express.Router();
const { getAllSellerOrders,getSellerOrderById,updateSellerOrderStatus } = require('../controllers/sellerOrderController');
const authSeller = require('../middleware/authSeller');
const { query,param ,body} = require('express-validator');

/**
 * Description: GET /api/seller/orders (Auth: Seller)
 * Purpose: Fetch all orders that include seller’s products
 */
router.get(
  '/',
  authSeller,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be positive integer'),
    query('status').optional().isString().trim(),
    query('search').optional().isString().trim(),
  ],
  getAllSellerOrders
);

// ✅ new route for getting single order by ID
router.get(
  '/:id',
  authSeller,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  getSellerOrderById
);
// ✅ Update Order Status
router.put(
  '/:id/status',
  authSeller,
  [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
      .withMessage('Invalid status value'),
  ],
  updateSellerOrderStatus
);

module.exports = router;
