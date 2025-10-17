const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SellerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  phone: { type: String, required: true, match: /^[0-9]+$/ },
  storeName: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
   status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedAt: {
      type: Date
    },
    rejectedAt: {
      type: Date
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
// SellerSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

module.exports = mongoose.model('Seller', SellerSchema);
