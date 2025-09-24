const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const { validateLogin } = require('../middleware/validation');

const router = express.Router();

// Rate limiter for auth routes to limit brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP
  message: { message: 'Too many requests, please try again later' }
});

// POST /api/auth/register - optional simple registration
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ message: 'User with that email or username already exists' });

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ username, email, password: hashed });
    await user.save();

    return res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { identifier, password, isEmail } = req.body;

    const query = isEmail ? { email: identifier } : { username: identifier };

    const user = await User.findOne(query);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Could log failed attempt
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const payload = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
