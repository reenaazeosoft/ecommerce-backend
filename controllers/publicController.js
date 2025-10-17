const { success, failure } = require('../utils/response');
const Service = require('../services/publicService');

/**
 * Description: GET /api/public/categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const data = await Service.getAllCategories();
    if (!data.length) return failure(res, 'No categories found', 404);
    return success(res, 'Categories fetched successfully', { categories: data });
  } catch (err) {
    console.error('[PublicController:getAllCategories] ERROR', err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /api/public/products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const data = await Service.getAllProducts(req.query);
    if (!data.products.length) return failure(res, 'No products found', 404);
    return success(res, 'Products fetched successfully', data);
  } catch (err) {
    console.error('[PublicController:getAllProducts] ERROR', err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /api/public/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const data = await Service.getProductById(req.params.id);
    if (!data) return failure(res, 'Product not found', 404);
    return success(res, 'Product details fetched successfully', { product: data });
  } catch (err) {
    console.error('[PublicController:getProductById] ERROR', err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
/**
 * Description: GET /api/public/categories/:id/products
 * Purpose: Fetch all products under a specific category for frontend.
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const data = await Service.getProductsByCategory(req.params.id, req.query);
    if (!data.products.length) return failure(res, 'No products found for this category', 404);
    return success(res, 'Products fetched successfully', data);
  } catch (err) {
    console.error('[PublicController:getProductsByCategory] ERROR', err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};