const express = require('express');
const { body } = require('express-validator');
const authUser = require('../middleware/authUser'); // already exists
const { registerCustomer,loginCustomer,getCustomerProfile,updateCustomerProfile,changeCustomerPassword  } = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
// 🖼️ Multer config for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'customers');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

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
/**
 * Description: PUT /api/customer/profile (Auth: Customer)
 */
router.put(
  '/profile',
  authUser,
  upload.single('profileImage'),
  [
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone must contain 10 digits only'),
    body('name').optional().isString().trim(),
    body('address').optional().isString().trim(),
  ],
  updateCustomerProfile
);
/**
 * Description: PUT /api/customer/change-password (Auth: Customer)
 */
router.put(
  '/change-password',
  authUser,
  [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
  ],
  changeCustomerPassword
);
router.get('/profile', authUser, getCustomerProfile);
module.exports = router;
