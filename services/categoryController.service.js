const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Category = require('../models/Category');

module.exports = {
  async createCategory(body, user, file) {
    const { name, description, parentId } = body;
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) throw new Error('Category already exists');

    let parent = null;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) throw new Error('Invalid parentId');
      parent = parentId;
    }

    const image = file ? file.filename : null;
    const category = new Category({
      name: name.trim(),
      description,
      parentId: parent,
      image,
      createdBy: user.id
    });

    await category.save();
    return category;
  },

  async deleteCategory(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid category ID');
    const category = await Category.findById(id);
    if (!category) throw new Error('Category not found');

    if (category.image) {
      const imagePath = path.join(__dirname, '..', 'uploads', category.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Category.findByIdAndDelete(id);
    return { id };
  },

  async getAllCategories(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = query.search || '';

    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

    const categories = await Category.find(filter).populate('parentId', 'name').skip(skip).limit(limit).sort({ createdAt: -1 }).lean();
    const total = await Category.countDocuments(filter);

    return {
      pagination: { total, totalPages: Math.ceil(total / limit), page, limit },
      categories
    };
  },

  async getCategoryById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid category ID');
    const category = await Category.findById(id).populate('parentId', 'name').lean();
    if (!category) throw new Error('Category not found');
    return category;
  },

  async updateCategory(id, body, file) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid category ID');
    const { name, description, parentId } = body;
    const category = await Category.findById(id);
    if (!category) throw new Error('Category not found');

    if (file) {
      if (category.image) {
        const oldPath = path.join(__dirname, '..', 'uploads', category.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      category.image = file.filename;
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) category.parentId = parentId;

    await category.save();
    return category;
  }
};
