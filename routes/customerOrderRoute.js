/**
 * Description: Customer Order Routes
 * Base Path: /api/customer/orders
 */
const express = require('express');
const router = express.Router();
const { placeOrder ,getAllCustomerOrders,getCustomerOrderById,cancelCustomerOrder,trackCustomerOrder} = require('../controllers/customerOrderController');
const authUser = require('../middleware/authUser');
const { body,query,param } = require('express-validator');

/**
 * Description: POST /api/customer/orders
 * Purpose: Place a new order
 */
router.post(
  '/',
  authUser,
  [
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod')
      .isIn(['COD', 'ONLINE', 'CARD', 'UPI'])
      .withMessage('Invalid payment method'),
    body('cartId').isMongoId().withMessage('Invalid cart ID'),
  ],
  placeOrder
);
/**
 * Description: GET /api/customer/orders
 * Purpose: Fetch paginated list of customer's orders
 */
router.get(
  '/',
  authUser,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('status').optional().isString().trim(),
  ],
  getAllCustomerOrders
);
/**
 * Description: GET /api/customer/orders/:id
 * Purpose: Fetch single order details by ID
 */
router.get(
  '/:id',
  authUser,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  getCustomerOrderById
);

/**
 * Description: PUT /api/customer/orders/:id/cancel
 * Purpose: Customer cancels order before shipping
 */
router.put(
  '/:id/cancel',
  authUser,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  cancelCustomerOrder
);

/**
 * Description: GET /api/customer/orders/:id/track (Auth: Customer)
 */
router.get(
  '/:id/track',
  authUser,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  trackCustomerOrder
);
module.exports = router;
