const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const Service = require('../services/customerPaymentService');

/**
 * Description: POST /api/customer/payments (Auth: Customer)
 * Purpose: Customer makes a payment for their order.
 */
exports.makePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.makePayment(req.user.id, req.body);
    return success(res, 'Payment processed successfully', data);
  } catch (err) {
    console.error(`[Controller:customerPaymentController.makePayment] ERROR`, err);

    if (err.message === 'Order not found')
      return failure(res, err.message, 404);
    if (err.message.includes('Invalid') || err.message.includes('mismatch'))
      return failure(res, err.message, 422);

    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
