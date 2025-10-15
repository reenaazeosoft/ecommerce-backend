const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { getClient } = require('../config/redis');
module.exports = {
  async addProduct(body, user, files) {
    const redis = getClient();
    const { name, description, price, stock, categoryId } = body;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new Error('Invalid category ID');

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) throw new Error('Category not found');

    let images = [];
    if (files && files.length > 0) {
      images = files.map(f => `/uploads/products/${f.filename}`);
    }

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      categoryId,
      sellerId: user.id,
      images
    });
    await redis.setEx('products:all', 600, JSON.stringify(products));
    if (cached) {
      console.log('📦 Serving from Redis cache');
      return JSON.parse(cached);
    }

    await newProduct.save();
     // 3️⃣ Cache for 10 minutes (600 seconds)
    await redis.setEx('products:all', 600, JSON.stringify(products));
    console.log('💾 Stored in Redis cache');
    return {
      id: newProduct._id,
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock,
      categoryId: newProduct.categoryId,
      images: newProduct.images
    };
  }
};
