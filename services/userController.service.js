const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/User');

module.exports = {
  /**
   * Customer login
   */
  async loginCustomer(body) {
    const { email, password } = body;

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // ✅ Save last login time
    customer.lastLogin = new Date();
    await customer.save();

    return {
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
    };
  },

  /**
   * Customer registration
   */
  async registerCustomer(body) {
    const { name, email, password, phone, address } = body;

    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('Email already registered');

    // ✅ Hash password before saving
    const hashed = await bcrypt.hash(password, 10);

    const customer = new Customer({
      name,
      email: email.toLowerCase(),
      password: hashed,
      phone,
      address,
    });

    await customer.save();

    return {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    };
  },

  /**
   * Get Customer Profile by ID
   */
  async getCustomerProfile(customerId) {
    const customer = await Customer.findById(customerId)
      .select('-password')
      .lean();
    return customer || null;
  },

  /**
   * Update Customer Profile
   */
  async updateCustomerProfile(customerId, body, file) {
    const { name, phone, address } = body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;

    if (file) {
      updateFields.profileImage = `/uploads/customers/${file.filename}`;
    }

    const updated = await Customer.findByIdAndUpdate(customerId, updateFields, {
      new: true,
    })
      .select('-password')
      .lean();

    if (!updated) throw new Error('Customer not found');
    return updated;
  },

  /**
   * Change Customer Password
   */
  async changeCustomerPassword(customerId, oldPassword, newPassword) {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error('Customer not found');

    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      const err = new Error('Old password is incorrect');
      err.statusCode = 401;
      throw err;
    }

    if (newPassword.length < 8)
      throw new Error('New password must be at least 8 characters long');

    const hashed = await bcrypt.hash(newPassword, 10);
    customer.password = hashed;
    await customer.save();

    return { id: customer._id, message: 'Password updated successfully' };
  },
};
