const mongoose = require('mongoose');

// 🧠 Product Schema
// Each product belongs to a category and a seller
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    // 🖼️ Array of image URLs (optional)
    images: [
      {
        type: String
      }
    ],
    // 🔗 Relation to Category collection
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    // 🧍 Relation to Seller who added the product
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true
    },
    // 🕒 Auto timestamps
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
