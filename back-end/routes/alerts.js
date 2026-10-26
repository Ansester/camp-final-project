const express = require("express");
const router = express.Router();
const Borrowal = require('../models/Borrowal');
const Reservation = require('../models/Reservation');
const Fine = require('../models/Fine');
const { authenticate } = require('../middleware/auth');

// GET /api/alerts - Get user alerts
router.get("/", authenticate, async (req, res) => {
  try {
    const alerts = [];

    // Check for overdue items
    const overdueItems = await Borrowal.find({
      user: req.userId,
      status: 'overdue'
    })
      .populate('item', 'name')
      .limit(10);

    overdueItems.forEach(b => {
      alerts.push({
        id: `overdue-${b._id}`,
        type: 'overdue',
        severity: 'high',
        message: `${b.item?.name || 'Unknown item'} is overdue by ${b.daysOverdue} day(s)`,
        createdAt: b.dueDate
      });
    });

    // Check for items due soon (within 24 hours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueSoonItems = await Borrowal.find({
      user: req.userId,
      status: 'active',
      dueDate: { $lte: tomorrow }
    })
      .populate('item', 'name')
      .limit(10);

    dueSoonItems.forEach(b => {
      alerts.push({
        id: `due-soon-${b._id}`,
        type: 'due-soon',
        severity: 'medium',
        message: `${b.item?.name || 'Unknown item'} is due soon (${b.dueDate.toLocaleDateString()})`,
        createdAt: b.checkoutDate
      });
    });

    // Check for ready reservations
    const readyReservations = await Reservation.find({
      user: req.userId,
      status: 'confirmed',
      pickupDate: { $lte: new Date() },
      expiryDate: { $gt: new Date() }
    })
      .populate('item', 'name')
      .limit(10);

    readyReservations.forEach(r => {
      alerts.push({
        id: `reservation-${r._id}`,
        type: 'reservation-ready',
        severity: 'medium',
        message: `${r.item?.name || 'Unknown item'} is ready for pickup`,
        createdAt: r.updatedAt
      });
    });

    // Check for unpaid fines
    const unpaidFines = await Fine.find({
      user: req.userId,
      status: 'pending'
    })
      .populate('item', 'name')
      .limit(10);

    unpaidFines.forEach(f => {
      alerts.push({
        id: `fine-${f._id}`,
        type: 'unpaid-fine',
        severity: 'high',
        message: `Unpaid fine: $${f.amount} for ${f.item?.name || 'item'}`,
        createdAt: f.createdAt
      });
    });

    // Sort by severity and date
    alerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch alerts' });
  }
});

module.exports = router;
