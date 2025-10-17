const jwt = require('jsonwebtoken');
const Customer = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: Verify user exists
    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      return res.status(401).json({ message: 'Invalid token or customer not found' });
    }

    req.user = decoded; // contains id, role, etc.
    next();
  } catch (err) {
    console.error('[Middleware:authCustomer] ERROR:', err.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};