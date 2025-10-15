// routes/adminUsers.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User'); // Your User model

// @route   GET /api/admin/users/:id
// @desc    Get a specific user by ID
// @access  Admin
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Check if ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with user details
    res.status(200).json({
      message: 'User details fetched successfully',
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
