const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitize');
const Service = require('../services/sellerProductService');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const getMeta = (req) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  params: req.params,
  query: req.query,
  body: sanitizePayload(req.body),
});

/**
 * Description: POST /api/seller/products (Auth: Seller)
 * Purpose: Add a new product under the authenticated seller's account.
 * Parameters:
 *   - body: { name, price, stock, categoryId, description? }
 *   - files: images[] (optional)
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authSeller, upload.array('images', 5)]
 */
exports.addProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.addProduct(req.body, req.user, req.files);
    console.log(`[Controller:sellerProductController.addProduct] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Product added successfully', data);
  } catch (err) {
    console.error(`[Controller:sellerProductController.addProduct] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /api/seller/products (Auth: Seller)
 * Purpose: Retrieve all products listed by the authenticated seller, with pagination, search, and status filters.
 */
exports.getAllSellerProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.getAllSellerProducts(req.query, req.user);
    console.log(`[Controller:sellerProductController.getAllSellerProducts] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Products fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:sellerProductController.getAllSellerProducts] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};


/**
 * Description: PUT /api/seller/products/:id (Auth: Seller)
 * Purpose: Update an existing product owned by the authenticated seller.
 * Parameters:
 *   - params: { id: MongoID (required) }
 *   - body: { name?, description?, price?, stock?, categoryId?, status?, images? }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authSeller, upload.array('images', 5)]
 */
exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.updateProduct(req.params.id, req.body, req.user, req.files);
    if (!data) return failure(res, 'Product not found', 404);

    console.log(`[Controller:sellerProductController.updateProduct] SUCCESS`, {
      statusFlag: 1,
      request: getMeta(req),
    });
    return success(res, 'Product updated successfully', data);
  } catch (err) {
    console.error(`[Controller:sellerProductController.updateProduct] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: DELETE /api/seller/products/:id (Auth: Seller)
 * Purpose: Permanently delete a product owned by the authenticated seller.
 * Parameters:
 *   - params: { id (MongoID, required) }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authSeller]
 */
exports.deleteProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const deleted = await Service.deleteProduct(req.params.id, req.user);
    if (!deleted) return failure(res, 'Product not found', 404);

    console.log(`[Controller:sellerProductController.deleteProduct] SUCCESS`, {
      statusFlag: 1,
      request: getMeta(req),
    });
    return success(res, 'Product deleted successfully', { id: req.params.id });
  } catch (err) {
    console.error(`[Controller:sellerProductController.deleteProduct] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};


/**
 * Description: PUT /api/seller/products/:id/stock (Auth: Seller)
 * Purpose: Update the stock quantity for a product owned by the authenticated seller.
 * Parameters:
 *   - params: { id: MongoID (required) }
 *   - body: { stock: number (>=0, required) }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authSeller]
 */
exports.updateProductStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.updateProductStock(req.params.id, req.body, req.user);
    if (!data) return failure(res, 'Product not found', 404);

    console.log(`[Controller:sellerProductController.updateProductStock] SUCCESS`, {
      statusFlag: 1,
      request: getMeta(req),
    });
    return success(res, 'Stock updated successfully', data);
  } catch (err) {
    console.error(`[Controller:sellerProductController.updateProductStock] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
/**
 * Description: POST /api/seller/products/bulk-upload (Auth: Seller)
 * Purpose: Bulk upload multiple products via CSV or XLSX file.
 * Parameters:
 *   - file: products.csv or products.xlsx (required)
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authSeller, upload.single('file')]
 */
exports.bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) return failure(res, 'No file uploaded', 400);

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    // ✅ Validate file type
    if (!['.csv', '.xlsx'].includes(ext)) {
      fs.unlinkSync(filePath);
      return failure(res, 'Invalid file format. Only CSV or XLSX allowed.', 400);
    }

    // ✅ Parse file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // ✅ Validate required columns
    const requiredFields = ['name', 'description', 'price', 'stock', 'categoryId'];
    const missingColumns = requiredFields.filter(
      (col) => !Object.keys(data[0] || {}).includes(col)
    );
    if (missingColumns.length > 0) {
      fs.unlinkSync(filePath);
      return failure(res, `Missing required columns: ${missingColumns.join(', ')}`, 400);
    }

    // ✅ Call service
    const result = await Service.bulkUploadProducts(data, req.user);
    fs.unlinkSync(filePath);

    console.log(`[Controller:sellerProductController.bulkUploadProducts] SUCCESS`, {
      statusFlag: 1,
      request: { file: req.file.originalname, total: data.length },
    });
    return success(res, 'Products uploaded successfully', result);
  } catch (err) {
    console.error(`[Controller:sellerProductController.bulkUploadProducts] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};