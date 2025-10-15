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
