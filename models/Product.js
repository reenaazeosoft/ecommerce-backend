const mongoose = require('mongoose');

// 🧠 Product Schema
// Each product belongs to a category and a seller
const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
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
    },
  rating: { type: Number, default: 0 },
  reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
