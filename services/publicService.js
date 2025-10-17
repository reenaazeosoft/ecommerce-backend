/**
 * Description: Service for public APIs (no authentication required)
 */
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getAllCategories = async () => {
  const categories = await Category.find().lean();
  return categories;
};

exports.getAllProducts = async (query) => {
  const { page = 1, limit = 10, search, categoryId } = query;
  const filter = {};

  if (search) filter.name = { $regex: search, $options: 'i' };
  if (categoryId) filter.categoryId = categoryId;

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page: Number(page),
    limit: Number(limit),
  };
};

exports.getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate('categoryId', 'name description')
    .lean();
  return product;
};
/**
 * Description: Get products by category
 */
exports.getProductsByCategory = async (categoryId, query) => {
  const { page = 1, limit = 10, search } = query;
  const filter = { categoryId };

  if (search) filter.name = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page: Number(page),
    limit: Number(limit),
    categoryId,
  };
};