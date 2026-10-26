const express = require("express");
const router = express.Router();
const User = require('../models/User');
const Fine = require('../models/Fine');
const { authenticate, authorize } = require('../middleware/auth');
const { validateMongoId, validatePagination } = require('../middleware/validation');

// GET /api/users - Get all users (staff only)
router.get("/", authenticate, authorize('staff', 'admin'), validatePagination, async (req, res) => {
  try {
    const { role, page = 1, limit = 50, search } = req.query;

    const query = { isActive: true };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { netId: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get fines for each user
    const usersWithFines = await Promise.all(users.map(async (user) => {
      const fines = await Fine.find({ user: user._id, status: 'pending' })
        .select('amount reason description');

      return {
        id: user._id,
        name: user.fullName,
        netId: user.netId,
        email: user.email,
        role: user.role,
        campusCashBalance: user.campusCashBalance || 0,
        activeFines: fines.map(f => ({
          id: f._id,
          reason: f.description || f.reason,
          amount: f.amount,
          status: 'unpaid'
        }))
      };
    }));

    const total = await User.countDocuments(query);

    res.json({
      students: usersWithFines,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch users'
    });
  }
});

// GET /api/users/:userId - Get user profile
router.get("/:userId", authenticate, validateMongoId('userId'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own profile unless they're staff
    if (req.userId.toString() !== userId && !['staff', 'admin'].includes(req.userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const student = {
      name: user.fullName,
      email: user.email,
      netId: user.netId,
      phone: user.phone,
      campusCashBalance: user.campusCashBalance || 0,
      notificationPreferences: user.notificationPreferences
    };

    res.json({ student });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user'
    });
  }
});

// PUT /api/users/:userId - Update user profile
router.put("/:userId", authenticate, validateMongoId('userId'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only update their own profile unless they're staff
    if (req.userId.toString() !== userId && !['staff', 'admin'].includes(req.userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied'
      });
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field]) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user'
    });
  }
});

// POST /api/users/add-funds - Add Campus Cash funds (staff only)
router.post("/add-funds", authenticate, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId and amount are required'
      });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Amount must be a positive number'
      });
    }

    if (!require('mongoose').isValidObjectId(userId)) return res.status(400).json({ error: 'Invalid user ID' });
    const user = await User.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $inc: { campusCashBalance: parsedAmount } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      message: 'Funds added successfully',
      newBalance: user.campusCashBalance,
      addedAmount: parsedAmount,
      method: 'demo-credit',
      demo: true
    });
  } catch (error) {
    console.error('Error adding funds:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add funds'
    });
  }
});

// Legacy endpoints for backwards compatibility
router.post("/login", (req, res) => {
  res.status(301).json({
    message: 'Please use /api/auth/login endpoint',
    redirect: '/api/auth/login'
  });
});

router.post("/register", (req, res) => {
  res.status(301).json({
    message: 'Please use /api/auth/register endpoint',
    redirect: '/api/auth/register'
  });
});

module.exports = router;
