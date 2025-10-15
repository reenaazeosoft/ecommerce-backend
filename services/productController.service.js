// services/productController.service.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { getClient } = require('../config/redis');

module.exports = {
  async addProduct(body, user, files) {
    // safely get Redis client
    const redis = getClient();

    const { name, description, price, stock, categoryId } = body;

    // 1️⃣ Validate category
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error('Invalid category ID');
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      throw new Error('Category not found');
    }

    // 2️⃣ Handle image uploads
    let images = [];
    if (files && files.length > 0) {
      images = files.map((f) => `/uploads/products/${f.filename}`);
    }

    // 3️⃣ Create and save product
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      categoryId,
      sellerId: user.id,
      images,
    });

    await newProduct.save();

    // 4️⃣ Safely cache product list (ignore if Redis unavailable)
    try {
      if (redis) {
        // fetch all products again to cache full list
        const allProducts = await Product.find().lean();
        await redis.setEx('products:all', 600, JSON.stringify(allProducts));
        console.log('💾 Products cached in Redis');
      } else {
        console.warn('⚠️ Redis not initialized — skipping cache write');
      }
    } catch (err) {
      console.error('Redis cache error:', err.message);
    }

    // 5️⃣ Return newly created product
    return {
      id: newProduct._id,
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock,
      categoryId: newProduct.categoryId,
      images: newProduct.images,
    };
  },
};
