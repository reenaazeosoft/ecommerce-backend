// productController.js
const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitize');
const Service = require('../services/productController.service');

const getMeta = (req) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  params: req.params,
  query: req.query,
  body: sanitizePayload(req.body)
});

/**
 * Description: POST /products (Auth: Seller)
 * Purpose: Add a new product under the authenticated seller's account.
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: {
 *       name: string (required),
 *       price: number (>= 0, required),
 *       stock: integer (>= 0, required),
 *       categoryId: string (MongoID, required),
 *       description?: string (optional)
 *     }
 *   - files: images[] (up to 5, .jpg/.jpeg/.png/.webp, max 5MB each)
 * Result: { data, statusFlag, errorCode }
 * Middleware: [auth, upload.array('images', 5)]
 */
exports.addProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.addProduct(req.body, req.user, req.files);
    console.log(`[Controller:productController.addProduct] SUCCESS`, {
      statusFlag: 1,
      request: getMeta(req)
    });
    return success(res, 'Product added successfully', data);
  } catch (err) {
    console.error(`[Controller:productController.addProduct] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /api/public/products/:id
 * Purpose: Fetch detailed product information by ID for frontend display.
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('categoryId', 'name description')
      .lean();

    if (!product) return failure(res, 'Product not found', 404);

    return success(res, 'Product details fetched successfully', { product });
  } catch (err) {
    console.error('[PublicController:getProductById] ERROR', err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: POST /api/products/:id/reviews (Auth: Customer)
 * Purpose: Add a review to a product.
 * Parameters:
 *   - params: { id (MongoID, required) }
 *   - body: { rating: 1–5, comment: string (required) }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.addProductReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return failure(res, 'Validation failed', 422, errors.array());

    const { id } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.user.id;

    const review = await Service.addProductReview(id, { rating, comment }, customerId);

    console.log(`[Controller:productController.addProductReview] SUCCESS`, {
      statusFlag: 1,
      request: getMeta(req),
    });

    return success(res, 'Review added successfully', review);
  } catch (err) {
    console.error(`[Controller:productController.addProductReview] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
/**
 * Description: GET /api/products/:id/reviews
 * Purpose: Retrieve all reviews for a product.
 * Parameters:
 *   - params: { id (MongoID, required) }
 * Result: { data, statusFlag, errorCode }
 * Middleware: []
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Service.getProductReviews(id);
    if (!data) return failure(res, 'Product not found', 404);

    return success(res, 'Reviews fetched successfully', data);
  } catch (err) {
    console.error('[Controller:productController.getProductReviews] ERROR', err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};