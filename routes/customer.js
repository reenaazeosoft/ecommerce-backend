const express = require('express');
const { body } = require('express-validator');
const authUser = require('../middleware/authUser'); // already exists
const { registerCustomer,loginCustomer  } = require('../controllers/userController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').matches(/^[0-9]+$/).withMessage('Phone must contain digits only'),
    body('address').notEmpty().withMessage('Address is required')
  ],
  registerCustomer
);
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  loginCustomer
);
module.exports = router;
