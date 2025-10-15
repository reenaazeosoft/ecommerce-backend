// adminController.js
const { validationResult } = require('express-validator');
const { success, failure } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitize');
const Service = require('../services/adminController.service');

const getMeta = (req) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  params: req.params,
  query: req.query,
  body: sanitizePayload(req.body),
  user: req.user ? req.user.id : undefined
});

// ✅ Approve Seller
exports.approveSeller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.approveSeller(req.params.id, req.user);
    console.log(`[Controller:approveSeller] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Seller approved successfully', data);
  } catch (err) {
    console.error(`[Controller:approveSeller] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Reject Seller
exports.rejectSeller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.rejectSeller(req.params.id, req.user, req.body.reason);
    console.log(`[Controller:rejectSeller] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Seller rejected successfully', data);
  } catch (err) {
    console.error(`[Controller:rejectSeller] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Create User
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.createUser(req.body, req.user);
    console.log(`[Controller:createUser] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'User created successfully', data);
  } catch (err) {
    console.error(`[Controller:createUser] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Update User
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.updateUser(req.params.id, req.body, req.user);
    console.log(`[Controller:updateUser] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'User updated successfully', data);
  } catch (err) {
    console.error(`[Controller:updateUser] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Delete User
exports.deleteUser = async (req, res) => {
  try {
    const data = await Service.deleteUser(req.params.id, req.user);
    console.log(`[Controller:deleteUser] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'User deleted successfully', data);
  } catch (err) {
    console.error(`[Controller:deleteUser] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Delete Seller
exports.deleteSeller = async (req, res) => {
  try {
    const data = await Service.deleteSeller(req.params.id, req.user);
    console.log(`[Controller:deleteSeller] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Seller deleted successfully', data);
  } catch (err) {
    console.error(`[Controller:deleteSeller] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const data = await Service.getAllUsers();
    console.log(`[Controller:getAllUsers] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Users fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:getAllUsers] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Get All Sellers
exports.getAllSellers = async (req, res) => {
  try {
    const data = await Service.getAllSellers();
    console.log(`[Controller:getAllSellers] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Sellers fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:getAllSellers] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const data = await Service.getUserById(req.params.id);
    console.log(`[Controller:getUserById] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'User fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:getUserById] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Get Seller by ID
exports.getSellerById = async (req, res) => {
  try {
    const data = await Service.getSellerById(req.params.id);
    console.log(`[Controller:getSellerById] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Seller fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:getSellerById] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return failure(res, 'Validation failed', 422, errors.array());

    const data = await Service.login(req.body);
    console.log(`[Controller:login] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Login successful', data);
  } catch (err) {
    console.error(`[Controller:login] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};

// ✅ Get Me
exports.getMe = async (req, res) => {
  try {
    const data = await Service.getMe(req.user);
    console.log(`[Controller:getMe] SUCCESS`, { statusFlag: 1, request: getMeta(req) });
    return success(res, 'Profile fetched successfully', data);
  } catch (err) {
    console.error(`[Controller:getMe] ERROR`, err);
    return failure(res, err.message || 'Internal Server Error', 500);
  }
};
