const Customer = require('../models/User');

exports.createNewUser = async ({ name, email, mobile, password, role }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await Customer.findOne({
    $or: [{ email: normalizedEmail }, { mobile }]
  });
  if (existing) throw new Error('User already exists');

  const user = new Customer({ name, email: normalizedEmail, mobile, password, role });
  await user.save();
  return user;
};