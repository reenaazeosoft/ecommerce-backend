const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitize');
const Service = require('../services/customerOrderService');

const getMeta = (req) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  params: req.params,
  query: req.query,
  body: sanitizePayload(req.body),
});

/**
 * Description: POST /api/customer/orders (Auth: Customer)
 * Purpose: Place an order from the customer's cart.
 * Parameters:
 *   - body: { shippingAddress, paymentMethod, cartId }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.placeOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const { shippingAddress, paymentMethod, cartId } = req.body;
    const data = await Service.placeOrder(req.user.id, { shippingAddress, paymentMethod, cartId });

    console.log(`[Controller:customerOrderController.placeOrder] SUCCESS`, {
      statusFlag: 1,
      request: getMeta(req),
    });

    return success(res, 'Order placed successfully', data);
  } catch (err) {
    console.error(`[Controller:customerOrderController.placeOrder] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /api/customer/orders (Auth: Customer)
 * Purpose: Retrieve paginated list of customer orders with optional status filter.
 * Parameters:
 *   - query: { page?: number, limit?: number, status?: string }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.getAllCustomerOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const data = await Service.getAllCustomerOrders(req.user.id, { page, limit, status });

    if (!data.orders || data.orders.length === 0)
      return failure(res, 'No orders found', 404);

    return success(res, 'Orders fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:customerOrderController.getAllCustomerOrders] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /api/customer/orders/:id (Auth: Customer)
 * Purpose: Retrieve detailed info about a specific order placed by the logged-in customer.
 * Parameters:
 *   - params: { id (MongoID, required) }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.getCustomerOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Service.getCustomerOrderById(req.user.id, id);

    if (!data) return failure(res, 'Order not found', 404);

    return success(res, 'Order details fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:customerOrderController.getCustomerOrderById] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

