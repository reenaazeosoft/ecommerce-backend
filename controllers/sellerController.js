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

// 🔹 Change Password
exports.changeSellerPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return failure(res, 'Validation failed', 422, errors.array());
    }

    const data = await Service.changeSellerPassword(req.body, req.user);
    console.log(`[Controller:changeSellerPassword] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Password changed successfully', data);
  } catch (error) {
    console.error(`[Controller:changeSellerPassword] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};

// 🔹 Forgot Password
exports.forgotSellerPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return failure(res, 'Validation failed', 422, errors.array());
    }

    const data = await Service.forgotSellerPassword(req.body);
    console.log(`[Controller:forgotSellerPassword] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Password reset link sent', data);
  } catch (error) {
    console.error(`[Controller:forgotSellerPassword] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};

// 🔹 Get Profile
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

// 🔹 Login
exports.loginSeller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return failure(res, 'Validation failed', 422, errors.array());
    }

    const data = await Service.loginSeller(req.body);
    console.log(`[Controller:loginSeller] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Login successful', data);
  } catch (error) {
    console.error(`[Controller:loginSeller] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};

// 🔹 Register
exports.registerSeller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return failure(res, 'Validation failed', 422, errors.array());
    }

    const data = await Service.registerSeller(req.body);
    console.log(`[Controller:registerSeller] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Seller registered successfully', data);
  } catch (error) {
    console.error(`[Controller:registerSeller] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};

// 🔹 Update Profile
exports.updateSellerProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return failure(res, 'Validation failed', 422, errors.array());
    }

    const data = await Service.updateSellerProfile(req.body, req.user, req.file);
    console.log(`[Controller:updateSellerProfile] SUCCESS`, { request: getRequestMeta(req) });
    return success(res, 'Profile updated successfully', data);
  } catch (error) {
    console.error(`[Controller:updateSellerProfile] ERROR`, error);
    return failure(res, error.message || 'Internal Server Error', 500);
  }
};
