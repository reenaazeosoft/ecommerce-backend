const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const Service = require('../services/customerCartService');
const { sanitizePayload } = require('../utils/sanitize');

const getMeta = (req) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  params: req.params,
  query: req.query,
  body: sanitizePayload(req.body),
});

/**
 * Description: POST /api/customer/cart (Auth: Customer)
 * Purpose: Add a product to the customer's cart.
 * Parameters:
 *   - body: { productId, quantity }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const { productId, quantity } = req.body;
    const data = await Service.addToCart(req.user.id, productId, quantity);

    console.log(`[Controller:customerCartController.addToCart] SUCCESS`, {
      statusFlag: 1,
      request: getMeta(req),
    });

    return success(res, 'Item added to cart successfully', data);
  } catch (err) {
    console.error(`[Controller:customerCartController.addToCart] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
/**
 * Description: GET /api/customer/cart (Auth: Customer)
 * Purpose: Fetch logged-in customer's cart with populated product details.
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.getCart = async (req, res) => {
  try {
    const data = await Service.getCart(req.user.id);
    return success(res, 'Cart fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:customerCartController.getCart] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: PUT /api/customer/cart/:itemId (Auth: Customer)
 * Purpose: Update quantity for a cart item.
 * Parameters:
 *   - params: { itemId: string (MongoID, required) }
 *   - body: { quantity: number (> 0) }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const { itemId } = req.params;
    const { quantity } = req.body;

    const data = await Service.updateCartItem(req.user.id, itemId, quantity);

    return success(res, 'Cart updated successfully', data);
  } catch (err) {
    console.error(`[Controller:customerCartController.updateCartItem] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: DELETE /api/customer/cart/:itemId (Auth: Customer)
 * Purpose: Remove an item from the customer's cart.
 * Parameters:
 *   - params: { itemId: MongoID }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const data = await Service.removeFromCart(req.user.id, itemId);

    return success(res, 'Item removed successfully', data);
  } catch (err) {
    console.error(`[Controller:customerCartController.removeFromCart] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
