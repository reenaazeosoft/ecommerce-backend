// sellerController.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Seller = require('../models/Seller');

module.exports = {
  async changeSellerPassword(body, user) {
    const { oldPassword, newPassword } = body;
    const seller = await Seller.findById(user.id);
    if (!seller) throw new Error('Seller not found');

    const isMatch = await bcrypt.compare(oldPassword, seller.password);
    if (!isMatch) throw new Error('Old password is incorrect');

    seller.password = await bcrypt.hash(newPassword, 10);
    await seller.save();

    return { id: seller._id };
  },

  async forgotSellerPassword(body) {
    const { email } = body;
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) throw new Error('Seller not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    seller.resetPasswordToken = resetToken;
    seller.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await seller.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: seller.email,
      subject: 'Password Reset Request',
      html: `<p>Hello ${seller.name || seller.storeName},</p>
             <p>Click below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`
    });

    return { email: seller.email };
  },

  async getSellerProfile(user) {
    const seller = await Seller.findById(user.id).select('-password');
    if (!seller) throw new Error('Seller not found');
    return seller;
  },

  async loginSeller(body) {
    const { email, password } = body;
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: seller._id, role: 'seller' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    return {
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        storeName: seller.storeName,
        address: seller.address
      }
    };
  },

  async registerSeller(body) {
    const { name, email, password, phone, storeName, address } = body;
    const existing = await Seller.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('Email already registered');

    const seller = new Seller({ name, email, password, phone, storeName, address });
    await seller.save();
    return {
      id: seller._id,
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      storeName: seller.storeName,
      address: seller.address
    };
  },

  async updateSellerProfile(body, user, file) {
    const sellerId = user.id;
    if (!mongoose.Types.ObjectId.isValid(sellerId)) throw new Error('Invalid seller ID');

    const updateData = {};
    const { storeName, address, phone, description } = body;
    if (storeName) updateData.storeName = storeName;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (description) updateData.description = description;

    if (file) {
      const logoPath = `/uploads/sellers/${file.filename}`;
      const existing = await Seller.findById(sellerId);
      if (existing.logo && existing.logo !== logoPath) {
        const oldPath = path.join(__dirname, '..', existing.logo);
        fs.unlink(oldPath, err => err && console.warn('Failed to delete old logo:', err.message));
      }
      updateData.logo = logoPath;
    }

    const updated = await Seller.findByIdAndUpdate(sellerId, { $set: updateData }, { new: true }).select('-password');
    if (!updated) throw new Error('Seller not found');

    return updated;
  }
};
