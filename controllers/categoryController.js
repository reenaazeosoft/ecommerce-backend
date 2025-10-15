// categoryController.js
const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitize');
const Service = require('../services/categoryController.service');

const getMeta = (req) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  params: req.params,
  query: req.query,
  body: sanitizePayload(req.body)
});

/**
 * Description: POST /categories (Auth: Admin)
 * Purpose: Create a new product category (supports nested categories).
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: {
 *       name: string (required),
 *       description?: string (optional),
 *       parentId?: string (MongoID, optional)
 *     }
 *   - file: image (optional, .jpg/.jpeg/.png, stored in /uploads/categories/)
 * Result: { data, statusFlag, errorCode }
 * Middleware: [auth, upload.single('image')]
 */
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.createCategory(req.body, req.user, req.file);
    console.log(`[Controller:categoryController.createCategory] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Category created successfully', data);
  } catch (err) {
    console.error(`[Controller:categoryController.createCategory] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: DELETE /categories/:id (Auth: Admin)
 * Purpose: Permanently delete a category by its ID.
 * Parameters:
 *   - params: { id }
 *   - query: {}
 *   - body: {}
 * Result: { data, statusFlag, errorCode }
 * Middleware: [auth]
 */
exports.deleteCategory = async (req, res) => {
  try {
    const data = await Service.deleteCategory(req.params.id);
    console.log(`[Controller:categoryController.deleteCategory] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Category deleted successfully', data);
  } catch (err) {
    console.error(`[Controller:categoryController.deleteCategory] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /categories (Auth: Admin)
 * Purpose: Retrieve a paginated list of all categories with optional search.
 * Parameters:
 *   - params: {}
 *   - query: {
 *       page?: number,
 *       limit?: number,
 *       search?: string (optional)
 *     }
 *   - body: {}
 * Result: { data, statusFlag, errorCode }
 * Middleware: [auth]
 */
exports.getAllCategories = async (req, res) => {
  try {
    const data = await Service.getAllCategories(req.query);
    console.log(`[Controller:categoryController.getAllCategories] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Categories fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:categoryController.getAllCategories] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /categories/:id (Auth: Admin)
 * Purpose: Fetch category details by ID (including parent info if available).
 * Parameters:
 *   - params: { id }
 *   - query: {}
 *   - body: {}
 * Result: { data, statusFlag, errorCode }
 * Middleware: [auth]
 */
exports.getCategoryById = async (req, res) => {
  try {
    const data = await Service.getCategoryById(req.params.id);
    console.log(`[Controller:categoryController.getCategoryById] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Category fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:categoryController.getCategoryById] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: PUT /categories/:id (Auth: Admin)
 * Purpose: Update category information (name, description, parentId, or image).
 * Parameters:
 *   - params: { id }
 *   - query: {}
 *   - body: {
 *       name?: string,
 *       description?: string,
 *       parentId?: string (MongoID, optional)
 *     }
 *   - file: image (optional, .jpg/.jpeg/.png)
 * Result: { data, statusFlag, errorCode }
 * Middleware: [auth, upload.single('image')]
 */
exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.updateCategory(req.params.id, req.body, req.file);
    console.log(`[Controller:categoryController.updateCategory] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Category updated successfully', data);
  } catch (err) {
    console.error(`[Controller:categoryController.updateCategory] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
