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

// 🔹 Create Category
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

// 🔹 Delete Category
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

// 🔹 Get All Categories
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

// 🔹 Get Category by ID
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

// 🔹 Update Category
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
