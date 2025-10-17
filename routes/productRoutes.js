const express = require('express');
const { body,param } = require('express-validator');
const authUser = require('../middleware/authUser');
const multer = require('multer');
const path = require('path');
const { addProductReview ,getProductReviews } = require('../controllers/productController');

const router = express.Router();


/**
 * Description: POST /api/products/:id/reviews (Auth: Customer)
 * Purpose: Add a product review.
 */
router.post(
  '/:id/reviews',
  authUser,
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .notEmpty()
      .trim()
      .withMessage('Comment cannot be empty'),
  ],
  addProductReview
);
/**
 * Description: GET /api/products/:id/reviews (Public)
 * Purpose: Get all product reviews
 */
router.get(
  '/:id/reviews',
  [param('id').isMongoId().withMessage('Invalid product ID')],
  getProductReviews
);


module.exports = router;
