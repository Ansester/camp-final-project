const r = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

r.post('/register', authLimiter, validateUserRegistration, async (req, res) => {
  try {
    const { netId, email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { netId }] });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email or NetID already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      netId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'student',
      phone,
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user'
    });
  }
});

r.post('/login', authLimiter, validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Account is inactive'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return user data (without password)
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login'
    });
  }
});

// POST /api/auth/student/login - Legacy endpoint for student login
r.post('/student/login', authLimiter, validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'student' });
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({ token, userId: user._id, user: userData });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/staff/login - Staff login endpoint
r.post('/staff/login', authLimiter, validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: { $in: ['staff', 'admin'] } });
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({ token, userId: user._id, user: userData });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = r;
