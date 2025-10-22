const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const Service = require('../services/sellerOrderService');

exports.getAllSellerOrders = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.getAllSellerOrders(req.query, req.user);
    if (!data || data.total === 0) return failure(res, 'No orders found', 404);

    return success(res, 'Orders fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:sellerOrderController.getAllSellerOrders] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
/**
 * Description: GET /api/seller/orders/:id (Auth: Seller)
 * Purpose: Retrieve detailed info about a specific order that includes seller’s products.
 */
exports.getSellerOrderById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.getSellerOrderById(req.user, req.params.id);
    if (!data) return failure(res, 'Order not found', 404);

    return success(res, 'Order details fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:sellerOrderController.getSellerOrderById] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: PUT /api/seller/orders/:id/status (Auth: Seller)
 * Purpose: Allows a seller to update the order status for their own products.
 */
exports.updateSellerOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.updateSellerOrderStatus(req.user, id, status);
    return success(res, 'Order status updated successfully', data);
  } catch (err) {
    console.error(`[Controller:sellerOrderController.updateSellerOrderStatus] ERROR`, err);

    if (err.statusCode === 409)
      return failure(res, err.message, 409); // invalid transition
    if (err.message === 'Order not found')
      return failure(res, err.message, 404);

    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
