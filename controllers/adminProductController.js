const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitize');
const Service = require('../services/adminProductService');

const getMeta = (req) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  params: req.params,
  query: req.query,
  body: sanitizePayload(req.body)
});

/**
 * Description: GET /api/admin/products (Auth: Admin)
 * Purpose: Retrieve a paginated list of all products with optional search and category filter.
 * Parameters:
 *   - params: {}
 *   - query: {
 *       page?: number,
 *       limit?: number,
 *       search?: string,
 *       categoryId?: string (MongoID, optional)
 *     }
 *   - body: {}
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authAdmin]
 */
exports.getAllProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.getAllProducts(req.query);
    console.log(`[Controller:adminProductController.getAllProducts] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Products fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:adminProductController.getAllProducts] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};


/**
 * Description: GET /api/admin/products/:id (Auth: Admin)
 * Purpose: Fetch a product’s full details by its ID.
 * Parameters:
 *   - params: { id (MongoID, required) }
 *   - query: {}
 *   - body: {}
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authAdmin]
 */
exports.getProductById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.getProductById(req.params.id);
    if (!data) return failure(res, 'Product not found', 404);

    console.log(`[Controller:adminProductController.getProductById] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Product details fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:adminProductController.getProductById] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};


/**
 * Description: DELETE /api/admin/products/:id (Auth: Admin)
 * Purpose: Permanently delete a product by its ID.
 * Parameters:
 *   - params: { id (MongoID, required) }
 *   - query: {}
 *   - body: {}
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authAdmin]
 */
exports.deleteProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const deletedProduct = await Service.deleteProduct(req.params.id);
    if (!deletedProduct) return failure(res, 'Product not found', 404);

    console.log(`[Controller:adminProductController.deleteProduct] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Product deleted successfully', { id: req.params.id });
  } catch (err) {
    console.error(`[Controller:adminProductController.deleteProduct] ERROR`, err);
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

    // Validate file type
    if (!['.csv', '.xlsx'].includes(ext)) {
      fs.unlinkSync(filePath);
      return failure(res, 'Invalid file format. Only CSV or XLSX allowed.', 400);
    }

    // Parse file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Validate required columns
    const requiredFields = ['name', 'price', 'stock', 'categoryId', 'description'];
    const missingColumns = requiredFields.filter(
      (col) => !Object.keys(data[0] || {}).includes(col)
    );
    if (missingColumns.length > 0) {
      fs.unlinkSync(filePath);
      return failure(res, `Missing required columns: ${missingColumns.join(', ')}`, 400);
    }

    // Pass to service
    const result = await Service.bulkUploadProducts(data, req.user);

    fs.unlinkSync(filePath); // cleanup temp file

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