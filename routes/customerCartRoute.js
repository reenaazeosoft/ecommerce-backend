/**
 * Description: Customer Cart Routes
 * Base path: /api/customer/cart
 */
const express = require('express');
const router = express.Router();
const { addToCart ,getCart,updateCartItem,removeFromCart } = require('../controllers/customerCartController');
const authUser = require('../middleware/authUser');
const { body,param } = require('express-validator');

/**
 * Description: POST /api/customer/cart
 * Purpose: Add an item to the cart.
 */
router.post(
  '/',
  authUser,
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be greater than zero'),
  ],
  addToCart
);
/**
 * Description: GET /api/customer/cart
 * Purpose: Fetch logged-in customer's cart.
 */
router.get('/', authUser, getCart);
/**
 * Description: PUT /api/customer/cart/:itemId
 * Purpose: Update cart item quantity
 */
router.put(
  '/:itemId',
  authUser,
  [
    param('itemId').isMongoId().withMessage('Invalid item ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be greater than zero'),
  ],
  updateCartItem
);
/**
 * Description: DELETE /api/customer/cart/:itemId
 * Purpose: Remove an item from cart
 */
router.delete(
  '/:itemId',
  authUser,
  [param('itemId').isMongoId().withMessage('Invalid item ID')],
  removeFromCart
);
module.exports = router;
