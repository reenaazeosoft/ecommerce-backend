// sellerController.js
const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitize');
const Service = require('../services/sellerController.service');

function getRequestMeta(req) {
  return {
    method: req.method,
    url: req.originalUrl || req.url,
    params: req.params,
    query: req.query,
    body: sanitizePayload(req.body)
  };
}

/**
 * Description: POST /register (Auth: None)
 * Purpose: Register a new seller account.
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: {
 *       name: string (required),
 *       email: string (required, valid email),
 *       password: string (min 8 chars, required),
 *       phone: string (10 digits, required),
 *       storeName: string (required),
 *       address: string (required)
 *     }
 * Result: { data, statusFlag, errorCode }
 * Middleware: []
 */
exports.registerSeller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.registerSeller(req.body);
    console.log(`[Controller:registerSeller] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Seller registered successfully', data);
  } catch (error) {
    console.error(`[Controller:registerSeller] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: POST /login (Auth: None)
 * Purpose: Authenticate an existing seller and issue a JWT.
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: { email: string, password: string }
 * Result: { data, statusFlag, errorCode }
 * Middleware: []
 */
exports.loginSeller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.loginSeller(req.body);
    console.log(`[Controller:loginSeller] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Login successful', data);
  } catch (error) {
    console.error(`[Controller:loginSeller] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: GET /profile (Auth: Seller)
 * Purpose: Fetch the authenticated seller's profile information.
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: {}
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authSeller]
 */
exports.getSellerProfile = async (req, res) => {
  try {
    const data = await Service.getSellerProfile(req.user);
    console.log(`[Controller:getSellerProfile] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Profile fetched successfully', data);
  } catch (error) {
    console.error(`[Controller:getSellerProfile] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: PUT /profile (Auth: Seller)
 * Purpose: Update seller profile details with optional logo upload.
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: {
 *       storeName?: string,
 *       address?: string,
 *       phone?: string (10 digits),
 *       description?: string
 *     }
 *   - file: logo (optional, .jpg/.jpeg/.png/.webp, max 2MB)
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authSeller, upload.single('logo')]
 */
exports.updateSellerProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.updateSellerProfile(req.body, req.user, req.file);
    console.log(`[Controller:updateSellerProfile] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Profile updated successfully', data);
  } catch (error) {
    console.error(`[Controller:updateSellerProfile] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: PUT /change-password (Auth: Seller)
 * Purpose: Allow seller to change their password using the current password.
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: {
 *       oldPassword: string (required),
 *       newPassword: string (min 8 chars, required)
 *     }
 * Result: { data, statusFlag, errorCode }
 * Middleware: [authSeller]
 */
exports.changeSellerPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.changeSellerPassword(req.body, req.user);
    console.log(`[Controller:changeSellerPassword] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Password changed successfully', data);
  } catch (error) {
    console.error(`[Controller:changeSellerPassword] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};

/**
 * Description: POST /forgot-password (Auth: None)
 * Purpose: Send a password reset link to the seller’s registered email.
 * Parameters:
 *   - params: {}
 *   - query: {}
 *   - body: { email: string (valid email, required) }
 * Result: { data, statusFlag, errorCode }
 * Middleware: []
 */
exports.forgotSellerPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.forgotSellerPassword(req.body);
    console.log(`[Controller:forgotSellerPassword] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Password reset link sent', data);
  } catch (error) {
    console.error(`[Controller:forgotSellerPassword] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};
