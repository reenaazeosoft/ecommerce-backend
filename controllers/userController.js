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
