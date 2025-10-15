const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/User');

module.exports = {
  async loginCustomer(body) {
    const { email, password } = body;

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '8h' });

    customer.lastLogin = new Date();
    await customer.save();

    return {
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      }
    };
  },

  async registerCustomer(body) {
    const { name, email, password, phone, address } = body;
    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const customer = new Customer({ name, email: email.toLowerCase(), password: hashed, phone, address });
    await customer.save();

    return {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    };
  }
};
