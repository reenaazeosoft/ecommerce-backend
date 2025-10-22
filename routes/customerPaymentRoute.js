const express = require('express');
const router = express.Router();
const { makePayment } = require('../controllers/customerPaymentController');
const authUser = require('../middleware/authUser');
const { body } = require('express-validator');

/**
 * Description: POST /api/customer/payments (Auth: Customer)
 */
router.post(
  '/',
  authUser,
  [
    body('orderId').isMongoId().withMessage('Invalid order ID'),
    body('paymentMethod')
      .isIn(['COD', 'CARD', 'UPI', 'ONLINE'])
      .withMessage('Invalid payment method'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  ],
  makePayment
);

module.exports = router;
