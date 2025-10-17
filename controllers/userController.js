// userController.js
const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitize');
const Service = require('../services/userController.service');

const getMeta = (req) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  params: req.params,
  query: req.query,
  body: sanitizePayload(req.body)
});

/**
 * Description: POST /login (Auth: None)
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: { email, password }
 * Result: { data, statusFlag, errorCode }
 * Middleware: []
 */
exports.loginCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.loginCustomer(req.body);
    console.log(`[Controller:userController.loginCustomer] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Login successful', data);
  } catch (err) {
    console.error(`[Controller:userController.loginCustomer] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: POST /register (Auth: None)
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: { name, email, password, phone, address }
 * Result: { data, statusFlag, errorCode }
 * Middleware: []
 */
exports.registerCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.registerCustomer(req.body);
    console.log(`[Controller:userController.registerCustomer] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Customer registered successfully', data);
  } catch (err) {
    console.error(`[Controller:userController.registerCustomer] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /api/customer/profile (Auth: Customer)
 * Purpose: Retrieve the logged-in customer's profile information.
 * Parameters:
 *   - headers: { Authorization: Bearer <token> }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.getCustomerProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.getCustomerProfile(req.user.id);
    if (!data) return failure(res, 'Customer not found', 404);

    console.log(`[Controller:customerController.getCustomerProfile] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Customer profile fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:customerController.getCustomerProfile] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
/**
 * Description: PUT /api/customer/profile (Auth: Customer)
 * Purpose: Update logged-in customer's profile details.
 * Parameters:
 *   - body: { name?, address?, phone? }
 *   - file: profileImage (optional)
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer, upload.single('profileImage')]
 */
exports.updateCustomerProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const updatedData = await Service.updateCustomerProfile(req.user.id, req.body, req.file);
    return success(res, 'Profile updated successfully', updatedData);
  } catch (err) {
    console.error(`[Controller:customerController.updateCustomerProfile] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: PUT /api/customer/change-password (Auth: Customer)
 * Purpose: Change the logged-in customer's password after verifying the old one.
 * Parameters:
 *   - body: { oldPassword, newPassword }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authCustomer]
 */
exports.changeCustomerPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const { oldPassword, newPassword } = req.body;
    const result = await Service.changeCustomerPassword(req.user.id, oldPassword, newPassword);

    return success(res, 'Password changed successfully', result);
  } catch (err) {
    console.error(`[Controller:customerController.changeCustomerPassword] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};