// adminController.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Admin');
const Seller = require('../models/Seller');
const Customer = require('../models/User');

module.exports = {
  async updateSellerStatus(sellerId, adminUser, status, reason) {
  const updateData = { status };
  if (status === 'rejected') updateData.rejectionReason = reason || 'No reason provided';

  const seller = await Seller.findByIdAndUpdate(sellerId, updateData, { new: true });
  if (!seller) throw new Error('Seller not found');

  return seller;
}
,

 async createUser(body, adminUser) {
    const { name, email, password, phone, address, role, storeName } = body;

    // ✅ Select model based on role
    let Model;
    if (role === 'customer') Model = Customer;
    else if (role === 'seller') Model = Seller;
    else if (role === 'admin') Model = Admin;
    else throw new Error('Invalid role');

    // ✅ Check if email already exists
    const existing = await Model.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error(`${role} with this email already exists`);

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Build user data
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      address,
    };

    // ✅ Add seller-specific fields
    if (role === 'seller') {
      if (!storeName) throw new Error('storeName is required for sellers');
      userData.storeName = storeName;
      userData.status = 'pending';
    }

    // ✅ Create and save new record
    const newUser = new Model(userData);
    await newUser.save();

    // ✅ Return minimal safe response
    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      ...(role === 'seller' && { storeName: newUser.storeName }),
      role,
    };
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
    // ✅ Return only customers (exclude password)
    const customers = await Customer.find().select('-password');
    return customers;
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
    console.log(email);
    console.log(password);
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(user);
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
