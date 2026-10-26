const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateMongoId, handleValidationErrors } = require('../middleware/validation');

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.userId,
      isRead: false
    });
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch unread count' });
  }
});

// GET /api/notifications - Get user's notifications
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const { unreadOnly, page = 1, limit = 20 } = req.query;

    const query = { user: req.userId };
    if (unreadOnly === 'true') query.isRead = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notifications = await Notification.find(query)
      .populate('relatedItem', 'name')
      .populate('relatedBorrowal')
      .populate('relatedReservation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: req.userId, isRead: false });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, user: req.userId });
    if (!notification) {
      return res.status(404).json({ error: 'Not Found', message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.json({ message: 'All notifications marked as read', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update notifications' });
  }
});

function getDefaults() {
  return {
    email: true,
    sms: false,
    inApp: true,
    reminder: { startDaysBefore: 5, frequency: 'daily' },
  };
}

function coercePrefs(input = {}, current = getDefaults()) {
  const def = current.toObject ? current.toObject() : current;
  const out = { ...def };

  if (typeof input.email === 'boolean') out.email = input.email;
  if (typeof input.sms === 'boolean') out.sms = input.sms;
  if (typeof input.inApp === 'boolean') out.inApp = input.inApp;

  if (input.reminder && typeof input.reminder === 'object') {
    const r = { ...def.reminder };
    if (Number.isFinite(input.reminder.startDaysBefore)) {
      r.startDaysBefore = Number(input.reminder.startDaysBefore);
    }
    if (typeof input.reminder.frequency === 'string') {
      r.frequency = input.reminder.frequency;
    }
    out.reminder = r;
  }
  return out;
}

// GET /api/notifications/preferences - Get notification preferences
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('notificationPreferences');
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const prefs = user.notificationPreferences || getDefaults();
    return res.status(200).json({ userId: req.userId, ...prefs });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch preferences' });
  }
});

// PUT /api/notifications/preferences - Update notification preferences
router.put('/preferences', authenticate,
  require('express-validator').body('reminder.startDaysBefore').optional().isInt({ min: 0, max: 30 }),
  require('express-validator').body('reminder.frequency').optional().isIn(['daily', 'weekly', 'never']),
  handleValidationErrors, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const current = user.notificationPreferences || getDefaults();
    const updates = coercePrefs(req.body, current);
    const merged = {
      email: updates.email ?? current.email,
      sms: updates.sms ?? current.sms,
      inApp: updates.inApp ?? current.inApp,
      reminder: {
        startDaysBefore: (updates.reminder?.startDaysBefore ?? current.reminder?.startDaysBefore ?? 5),
        frequency: (updates.reminder?.frequency ?? current.reminder?.frequency ?? 'daily'),
      },
    };

    user.notificationPreferences = merged;
    await user.save();

    return res.status(200).json({ ok: true, userId: req.userId, ...merged });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update preferences' });
  }
});

module.exports = router;
