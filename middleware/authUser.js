const jwt = require('jsonwebtoken');
const Customer = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) return res.status(401).json({ message: 'Invalid token' });

    req.customer = customer;
    next();
  } catch (err) {
    console.error('authCustomer error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
