const express = require('express');
const { body, query } = require('express-validator');
const { login, getMe, getAllUsers,getUserById ,createUser,updateUser,deleteUser,getAllSellers,getSellerById,updateSellerStatus,deleteSeller} = require('../controllers/adminController');
const authAdmin = require('../middleware/auth'); // already exists
const isAdmin = require('../middleware/isAdmin'); // create this file
const router = express.Router();

// 🧠 Admin Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('invalid email'),
    body('password').isLength({ min: 6 }).withMessage('password too short')
  ],
  login
);

// 👤 Get Current Admin
router.get('/me', authAdmin, getMe);

// 👥 Get All Users (paginated, with optional search)
router.get(
  '/users',
  authAdmin, // ensure admin is authenticated
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
    query('search').optional().isString().trim().escape()
  ],
  getAllUsers
);

// 👤 Get User by ID
router.get(
  '/users/:id',
  authAdmin, // ensure admin is authenticated
  getUserById
);

// 🆕 Create user
router.post(
  '/users',
  authAdmin,
  isAdmin, // ensure only admins can create users
  [
    body('name').notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('invalid email'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 chars'),
    body('phone').matches(/^\d{10}$/).withMessage('phone must be 10 digits'),
    body('address').optional().isString(),
    body('role').optional().isIn(['customer', 'seller', 'admin']).withMessage('invalid role')
  ],
  createUser
);
module.exports = router;


router.put(
  '/users/:id',
  authAdmin, // ensure admin is logged in
  [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('address').optional().isString().withMessage('Address must be a string'),
    body('phone').optional().isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isString().withMessage('Role must be a string')
  ],
  updateUser
);

// delete user route
router.delete('/users/:id', authAdmin, deleteUser);

//Admin sellers Route
router.get('/sellers', authAdmin, getAllSellers);
// 👤 Get User by ID
router.get(
  '/sellers/:id',
  authAdmin, // ensure admin is authenticated
  getSellerById
);

// Single route for approve/reject seller
router.put('/sellers/:id/status', authAdmin, updateSellerStatus);

router.delete('/sellers/:id', authAdmin, deleteSeller);



