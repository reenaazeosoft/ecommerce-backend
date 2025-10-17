// services/productController.service.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/User');
const { getClient } = require('../config/redis');

module.exports = {
  /**
   * Add Product Review (Customer)
   * Description: Adds a customer review with rating and comment to a product.
   */
  async addProductReview(productId, { rating, comment }, customerId) {
    // 1️⃣ Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    // 2️⃣ Validate rating range
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // 3️⃣ Validate comment
    if (!comment || !comment.trim()) {
      throw new Error('Comment cannot be empty');
    }

    // 4️⃣ Find product
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    // 5️⃣ Verify customer
    const customer = await Customer.findById(customerId).select('name email');
    if (!customer) throw new Error('Customer not found');

    // 6️⃣ Create review object
    const review = {
      customerId,
      name: customer.name,
      rating,
      comment,
      createdAt: new Date(),
    };

    // 7️⃣ Push to reviews array
    product.reviews = product.reviews || [];
    product.reviews.push(review);

    // 8️⃣ Recalculate average rating
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();

    // 9️⃣ Optionally cache product reviews
    try {
      const redis = getClient();
      if (redis) {
        await redis.setEx(
          `product:${productId}:reviews`,
          600,
          JSON.stringify(product.reviews)
        );
        console.log(`💾 Cached reviews for product ${productId}`);
      }
    } catch (err) {
      console.warn('Redis cache skip:', err.message);
    }

    // 🔟 Return added review
    return review;
  },
  /**
 * Description: Get all reviews for a product
 */
async getProductReviews(productId) {
  // 1️⃣ Validate product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  const redis = getClient();

  // 2️⃣ Try cache first
  try {
    if (redis) {
      const cached = await redis.get(`product:${productId}:reviews`);
      if (cached) {
        console.log(`⚡ Redis: fetched cached reviews for product ${productId}`);
        return JSON.parse(cached);
      }
    }
  } catch (err) {
    console.warn('⚠️ Redis cache read skipped:', err.message);
  }

  // 3️⃣ Query DB
  const product = await Product.findById(productId).select('reviews').lean();
  if (!product) throw new Error('Product not found');

  const reviews = product.reviews || [];

  // 4️⃣ Cache for 10 min
  try {
    if (redis) {
      await redis.setEx(`product:${productId}:reviews`, 600, JSON.stringify(reviews));
      console.log(`💾 Cached reviews for product ${productId}`);
    }
  } catch (err) {
    console.warn('⚠️ Redis cache write skipped:', err.message);
  }

  return reviews;
},
};
