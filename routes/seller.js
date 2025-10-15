const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const authSeller = require('../middleware/authSeller'); // already exists
const { registerSeller,loginSeller,getSellerProfile,updateSellerProfile ,changeSellerPassword,forgotSellerPassword   } = require('../controllers/sellerController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').matches(/^[0-9]+$/).withMessage('Phone must contain digits only'),
    body('storeName').notEmpty().withMessage('Store name is required'),
    body('address').notEmpty().withMessage('Address is required')
  ],
  registerSeller
);
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  loginSeller
);

router.get('/profile', authSeller, getSellerProfile);


// 📁 Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/sellers');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});
// ✏️ Update seller profile (with logo upload)
router.put(
  '/profile',
  authSeller,
  upload.single('logo'),
  [
    body('storeName').optional().isString().trim(),
    body('address').optional().isString().trim(),
    body('phone').optional().isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'),
    body('description').optional().isString().trim()
  ],
  updateSellerProfile
);
// 🔐 Change password
router.put(
  '/change-password',
  authSeller,
  [
    body('oldPassword')
      .notEmpty()
      .withMessage('Old password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
  ],
  changeSellerPassword
);

// 🔑 Forgot Password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email is required')
  ],
  forgotSellerPassword
);

module.exports = router;
