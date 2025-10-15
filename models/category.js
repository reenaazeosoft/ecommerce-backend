const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    image: {
      type: String // store filename or URL
    },
    // ✅ NEW FIELD
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin', // or 'User' depending on who creates it
      required: true
    }
  },
  { timestamps: true }
);

// ✅ Prevent "Cannot overwrite model" error
module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);