/**
 * Description: Service layer for Admin Product operations.
 * Handles business logic for retrieving paginated & filtered products.
 */

const Product = require('../models/Product');

exports.getAllProducts = async (query) => {
  const { page = 1, limit = 10, search, categoryId } = query;

  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (categoryId) filter.categoryId = categoryId;

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter)
  ]);

  return {
    products,
    total,
    page: Number(page),
    limit: Number(limit)
  };
};

exports.getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate('categoryId', 'name description') // optional: include category info
    .lean();

  return product || null;
};


/**
 * Delete a product by its ID.
 * @param {String} id
 * @returns {Object|null} deletedProduct
 */
exports.deleteProduct = async (id) => {
  const deleted = await Product.findByIdAndDelete(id);
  return deleted || null;
};
