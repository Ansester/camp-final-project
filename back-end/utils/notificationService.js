const Notification = require('../models/Notification');
const User = require('../models/User');

// Late fee configuration mirrors the policies endpoint defaults
const LATE_FEE_DEFAULT = 5;
const CATEGORY_LATE_FEES = {
  Camera: 5,
  Computer: 10,
  Audio: 3,
  Lighting: 3,
  Accessory: 2,
  Other: 5,
};

const getLateFeeRate = (category) => CATEGORY_LATE_FEES[category] || LATE_FEE_DEFAULT;

/**
 * Create a notification and optionally send an email
 * @param {Object} options - Notification options
 * @param {String} options.userId - User ID
 * @param {String} options.type - Notification type
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 * @param {String} options.priority - Priority level (low, medium, high)
 * @param {String} options.relatedItem - Related item ID (optional)
 * @param {String} options.relatedBorrowal - Related borrowal ID (optional)
 * @param {String} options.relatedReservation - Related reservation ID (optional)
 * @param {Boolean} options.sendEmail - (unused) preserved for backward compatibility
 */
const createNotification = async (options) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      priority = 'medium',
      relatedItem = null,
      relatedBorrowal = null,
      relatedReservation = null,
    } = options;

    // Create in-app notification
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      priority,
      relatedItem,
      relatedBorrowal,
      relatedReservation,
      isRead: false,
    });

    await notification.save();

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Check for items nearing due date and send notifications
 */
const checkDueDateNotifications = async () => {
  try {
    const Borrowal = require('../models/Borrowal');
    const Item = require('../models/Item');

    // Get active borrowals
    const activeBorrowals = await Borrowal.find({
      status: 'active',
      dueDate: { $exists: true, $ne: null }
    })
      .populate('user', 'email notificationPreferences')
      .populate('item', 'name');

    const now = new Date();
    for (const borrowal of activeBorrowals) {
      if (!borrowal.user || !borrowal.item) continue;
      const prefs = borrowal.user.notificationPreferences;
      if (prefs?.inApp === false || prefs?.reminder?.frequency === 'never') continue;
      const dueDate = new Date(borrowal.dueDate);
      const daysUntilDue = Math.ceil((dueDate - now) / 86400000);
      const leadDays = prefs?.reminder?.startDaysBefore ?? 5;
      const shouldNotify = daysUntilDue === leadDays;
      const notificationMessage = `Your item "${borrowal.item.name}" is due in ${daysUntilDue} day(s) (${dueDate.toLocaleDateString()}).`;
      const priority = daysUntilDue <= 1 ? 'high' : 'medium';

      if (shouldNotify) {
        // Check if we already sent a notification for this borrowal today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingNotification = await Notification.findOne({
          user: borrowal.user._id,
          relatedBorrowal: borrowal._id,
          type: 'reminder',
          createdAt: { $gte: today }
        });

        if (!existingNotification) {
          await createNotification({
            userId: borrowal.user._id,
            type: 'reminder',
            title: 'Item Due Date Reminder',
            message: notificationMessage,
            priority,
            relatedBorrowal: borrowal._id,
            relatedItem: borrowal.item._id,
            sendEmailNotification: true,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking due date notifications:', error);
  }
};

/**
 * Check for waitlist items that are now available and notify users
 * Also expire 'notified' entries that have passed their 24-hour window
 */
const checkWaitlistNotifications = async () => {
  try {
    const Waitlist = require('../models/Waitlist');
    const Item = require('../models/Item');
    const Reservation = require('../models/Reservation');
    const Notification = require('../models/Notification');

    // First, expire old 'notified' entries that have passed 24 hours
    const now = new Date();
    await Waitlist.updateMany(
      {
        status: 'notified',
        expiresAt: { $lt: now }
      },
      {
        $set: { status: 'expired' }
      }
    );

    // Get all active waitlist entries
    const waitlistEntries = await Waitlist.find({
      status: 'waiting'
    })
      .populate('user', 'email notificationPreferences')
      .populate('item', 'name quantity availableQuantity status facility');

    for (const entry of waitlistEntries) {
      if (!entry.user || !entry.item || entry.user.notificationPreferences?.inApp === false) continue;

      const item = entry.item;

      // Compute actual availability (same logic as items route)
      const Borrowal = require('../models/Borrowal');
      const Reservation = require('../models/Reservation');

      const totalQty = item.quantity ?? 1;
      const activeBorrowals = await Borrowal.countDocuments({
        item: item._id,
        status: { $in: ['active', 'overdue'] }
      });
      const activeReservations = await Reservation.countDocuments({
        item: item._id,
        status: { $in: ['pending', 'confirmed'] }
      });
      const availableQty = Math.max(0, totalQty - activeBorrowals - activeReservations);

      // Item is available if status is 'available' and there's at least one unit available
      const isAvailable = item.status === 'available' && availableQty > 0;

      if (isAvailable && entry.position === 1) {
        // User is first in line and item is available
        // Check if we already notified them recently (within last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const existingNotification = await Notification.findOne({
          user: entry.user._id,
          relatedItem: entry.item._id,
          type: 'waitlist',
          createdAt: { $gte: oneHourAgo }
        });

        if (!existingNotification) {
          await createNotification({
            userId: entry.user._id,
            type: 'waitlist',
            title: 'Item Available from Waitlist',
            message: `Great news! The item "${item.name}" you were waiting for is now available. You have 24 hours to reserve it before it's offered to the next person in line.`,
            priority: 'high',
            relatedItem: entry.item._id,
            sendEmailNotification: true,
          });

          // Update waitlist entry status to 'notified' and set expiration (24 hours)
          entry.status = 'notified';
          entry.notifiedAt = new Date();
          entry.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
          await entry.save();
        }
      }
    }
  } catch (error) {
    console.error('Error checking waitlist notifications:', error);
  }
};

/**
 * Apply late-return fines for overdue borrowals and mark them overdue
 */
const applyOverdueFines = async () => {
  try {
    const Borrowal = require('../models/Borrowal');
    const Fine = require('../models/Fine');

    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;

    const overdueBorrowals = await Borrowal.find({
      status: { $in: ['active', 'overdue'] },
      dueDate: { $lt: now }
    })
      .populate('item', 'name category')
      .populate('user', '_id');

    for (const borrowal of overdueBorrowals) {
      const userId = borrowal.user?._id || borrowal.user;
      const daysOverdue = Math.max(1, Math.ceil((now - borrowal.dueDate) / msPerDay));

      if (borrowal.status !== 'overdue') {
        borrowal.status = 'overdue';
        await borrowal.save();
      }

      const existingFine = await Fine.findOne({ borrowal: borrowal._id, reason: 'late-return' });

      if (existingFine) {
        if (existingFine.status === 'pending') {
          const expectedAmount = daysOverdue * getLateFeeRate(borrowal.item?.category || 'Other');
          if (existingFine.amount !== expectedAmount) {
            existingFine.amount = expectedAmount;
            await existingFine.save();
          }
        }
        continue;
      }

      const rate = getLateFeeRate(borrowal.item?.category || 'Other');
      const amount = daysOverdue * rate;
      const fine = new Fine({
        user: userId,
        borrowal: borrowal._id,
        item: borrowal.item?._id || null,
        amount,
        reason: 'late-return',
        description: `Late return for ${borrowal.item?.name || 'item'} (${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue)`
      });

      await fine.save();

      try {
        await createNotification({
          userId,
          type: 'fine',
          title: 'Late return fine issued',
          message: `A fine of $${amount.toFixed(2)} was issued for ${borrowal.item?.name || 'your item'} (overdue ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}).`,
          relatedItem: borrowal.item?._id,
          relatedBorrowal: borrowal._id,
        });
      } catch (notifyErr) {
        console.error('Overdue fine notification failed:', notifyErr);
      }
    }
  } catch (error) {
    console.error('Error applying overdue fines:', error);
  }
};

/**
 * Notify the first person on the waitlist for a specific item that just became available
 * Called immediately when an item is returned/becomes available
 */
const notifyWaitlistForItem = async (itemId) => {
  try {
    const Waitlist = require('../models/Waitlist');
    const Item = require('../models/Item');
    const Notification = require('../models/Notification');

    const item = await Item.findById(itemId);
    if (!item) return;

    // Find the first person waiting for this item
    const firstInLine = await Waitlist.findOne({
      item: itemId,
      status: 'waiting',
      position: 1
    }).populate('user', 'email notificationPreferences');

    if (!firstInLine || !firstInLine.user || firstInLine.user.notificationPreferences?.inApp === false) return;

    // Check if we already notified them recently (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingNotification = await Notification.findOne({
      user: firstInLine.user._id,
      relatedItem: itemId,
      type: 'waitlist',
      createdAt: { $gte: oneHourAgo }
    });

    if (!existingNotification) {
      await createNotification({
        userId: firstInLine.user._id,
        type: 'waitlist',
        title: 'Item Available from Waitlist',
        message: `Great news! The item "${item.name}" you were waiting for is now available. You have 24 hours to reserve it before it's offered to the next person in line.`,
        priority: 'high',
        relatedItem: itemId,
        sendEmailNotification: true,
      });

      // Update waitlist entry status to 'notified' and set expiration
      firstInLine.status = 'notified';
      firstInLine.notifiedAt = new Date();
      firstInLine.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await firstInLine.save();

      console.log(`Notified user ${firstInLine.user._id} about waitlisted item ${item.name}`);
    }
  } catch (error) {
    console.error('Error notifying waitlist for item:', error);
  }
};

module.exports = {
  createNotification,
  checkDueDateNotifications,
  checkWaitlistNotifications,
  applyOverdueFines,
  notifyWaitlistForItem,
};

