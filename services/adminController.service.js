// adminController.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Admin');
const Seller = require('../models/Seller');

module.exports = {
  async approveSeller(sellerId, adminUser) {
    // Example placeholder logic
    const seller = await Seller.findByIdAndUpdate(sellerId, { status: 'approved' }, { new: true });
    if (!seller) throw new Error('Seller not found');
    return seller;
  },

  async rejectSeller(sellerId, adminUser, reason) {
    const seller = await Seller.findByIdAndUpdate(sellerId, { status: 'rejected', rejectionReason: reason }, { new: true });
    if (!seller) throw new Error('Seller not found');
    return seller;
  },

  async createUser(body, adminUser) {
    const { name, email, password, role } = body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('User already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    return user;
  },

  async updateUser(id, body, adminUser) {
    const updated = await User.findByIdAndUpdate(id, body, { new: true });
    if (!updated) throw new Error('User not found');
    return updated;
  },

  async deleteUser(id, adminUser) {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) throw new Error('User not found');
    return deleted;
  },

  async deleteSeller(id, adminUser) {
    const deleted = await Seller.findByIdAndDelete(id);
    if (!deleted) throw new Error('Seller not found');
    return deleted;
  },

  async getAllUsers() {
    const users = await User.find().select('-password');
    return users;
  },

  async getAllSellers() {
    const sellers = await Seller.find();
    return sellers;
  },

  async getUserById(id) {
    const user = await User.findById(id).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  },

  async getSellerById(id) {
    const seller = await Seller.findById(id);
    if (!seller) throw new Error('Seller not found');
    return seller;
  },

  async login(body) {
    const { email, password } = body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    };
  },

  async getMe(user) {
    const found = await User.findById(user.id).select('-password');
    if (!found) throw new Error('User not found');
    return found;
  }
};
