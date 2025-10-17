const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { getClient } = require('../config/redis');

/**
 * Add a new product for a seller
 */
exports.addProduct = async (body, user, files) => {
  const redis = getClient();
  const { name, description, price, stock, categoryId } = body;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new Error('Invalid category ID');
  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) throw new Error('Category not found');

  let images = [];
  if (files && files.length > 0) images = files.map((f) => `/uploads/products/${f.filename}`);

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

  try {
    if (redis) {
      const allProducts = await Product.find().lean();
      await redis.setEx('products:all', 600, JSON.stringify(allProducts));
    }
  } catch (err) {
    console.warn('Redis cache update skipped:', err.message);
  }

  return {
    id: newProduct._id,
    name: newProduct.name,
    price: newProduct.price,
    stock: newProduct.stock,
    categoryId: newProduct.categoryId,
    images: newProduct.images,
  };
};

/**
 * Get all products for logged-in seller
 */
exports.getAllSellerProducts = async (query, user) => {
  const { page = 1, limit = 10, search, status } = query;
  const filter = { sellerId: user.id };
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return { products, total, page: Number(page), limit: Number(limit) };
};


/**
 * Update seller product
 */
exports.updateProduct = async (id, body, user, files) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid product ID');

  const product = await Product.findOne({ _id: id, sellerId: user.id });
  if (!product) return null;

  const { name, description, price, stock, categoryId, status } = body;
  if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId))
    throw new Error('Invalid category ID');

  if (categoryId) {
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) throw new Error('Category not found');
    product.categoryId = categoryId;
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (status) product.status = status;

  // Handle new image uploads
  if (files && files.length > 0) {
    const newImages = files.map((f) => `/uploads/products/${f.filename}`);
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const filePath = path.join(__dirname, '..', img);
        fs.unlink(filePath, (err) => err && console.warn('Old image not deleted:', err.message));
      });
    }
    product.images = newImages;
  }

  const updated = await product.save();
  return updated;
};

/**
 * Delete seller product
 */
exports.deleteProduct = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid product ID');
  const product = await Product.findOneAndDelete({ _id: id, sellerId: user.id });
  return product || null;
};

/**
 * Update product stock for a seller
 */
exports.updateProductStock = async (id, body, user) => {
  const { stock } = body;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid product ID');
  if (stock < 0) throw new Error('Stock cannot be negative');

  const product = await Product.findOneAndUpdate(
    { _id: id, sellerId: user.id },
    { $set: { stock } },
    { new: true }
  );

  return product ? { id: product._id, stock: product.stock } : null;
};

/**
 * Bulk upload products for seller
 */
exports.bulkUploadProducts = async (rows, user) => {
  let successCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const row of rows) {
    try {
      const { name, description, price, stock, categoryId } = row;

      if (!name || !categoryId || price < 0 || stock < 0)
        throw new Error('Invalid data: name, categoryId, price, or stock missing/invalid');

      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) throw new Error(`Category not found: ${categoryId}`);

      const product = new Product({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId,
        sellerId: user.id,
        images: [],
      });

      await product.save();
      successCount++;
    } catch (error) {
      failedCount++;
      errors.push(error.message);
    }
  }

  return {
    total: rows.length,
    success: successCount,
    failed: failedCount,
    errors: errors.slice(0, 5), // send first 5 errors for readability
  };
};