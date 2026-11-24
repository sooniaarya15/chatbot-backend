const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpError = require('../utils/httpError');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw httpError(409, 'Email already registered');
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: sign(user._id), user: user.toSafe() });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Invalid email or password');
  res.json({ token: sign(user._id), user: user.toSafe() });
};

exports.me = async (req, res) => {
  res.json({ user: req.user.toSafe() });
};