require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }
    const admin = new Admin({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASS,
      name: 'Super Admin'
    });
    await admin.save();
    console.log('Admin created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
