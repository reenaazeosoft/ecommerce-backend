const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { createCategory,getAllCategories,getCategoryById,updateCategory,deleteCategory } = require('../controllers/categoryController');
const auth = require('../middleware/auth');

const router = express.Router();

// ✅ Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/categories/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ✅ Create Category
router.post(
  '/categories',
  auth, // ensure admin is authenticated
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('parentId')
      .optional()
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid parentId')
  ],
  createCategory
);
router.get('/categories', auth, getAllCategories);
router.get('/categories/:id', auth, getCategoryById);
router.put('/categories/:id', auth, upload.single('image'), updateCategory);
router.delete('/categories/:id', auth, deleteCategory);
module.exports = router;
