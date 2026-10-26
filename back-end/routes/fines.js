const express = require("express");
const router = express.Router();
const Fine = require('../models/Fine');
const Borrowal = require('../models/Borrowal');
const { createNotification } = require('../utils/notificationService');
const { authenticate, authorize } = require('../middleware/auth');
const { validateFineCreation, validateMongoId, validatePagination } = require('../middleware/validation');

// Helper to get validateMongoId middleware for 'id' param
const validateId = validateMongoId('id');

// GET /api/fines - Get user's fines
router.get("/", authenticate, validatePagination, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, userId } = req.query;

    const query = {};
    // If staff/admin, allow querying by userId. Otherwise force own ID.
    if (['staff', 'admin'].includes(req.userRole) && userId) {
      query.user = userId;
    } else {
      query.user = req.userId;
    }

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const fines = await Fine.find(query)
      .populate('borrowal')
      .populate('item', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const results = fines.map(f => {
      const formatDate = (date) => date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

      return {
        id: f._id,
        type: f.reason.charAt(0).toUpperCase() + f.reason.slice(1),
        item: f.item?.name || 'Unknown',
        amount: f.amount,
        dueDate: f.borrowal?.dueDate ? formatDate(f.borrowal.dueDate) : null,
        assessed: formatDate(f.createdAt),
        paid: f.status === 'paid' ? formatDate(f.paidDate) : null,
        receipt: f.receiptNumber,
        status: f.status === 'paid' ? 'Paid' : 'Unpaid',
        ref: `F-${f._id.toString().slice(-4).toUpperCase()}`
      };
    });

    const total = await Fine.countDocuments(query);
    const totalUnpaid = await Fine.aggregate([
      { $match: { user: req.userId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      fines: results,
      summary: {
        totalUnpaid: totalUnpaid[0]?.total || 0,
        count: total
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching fines:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch fines' });
  }
});

// Both demo-payment URLs share ownership, balance, and transaction checks.
router.post('/:id/pay', authenticate, validateId, async (req, res) => {
  try {
    const { settleDemoFine } = require('../utils/demoPayment');
    const fine = await settleDemoFine({ fineId: req.params.id, userId: req.userId, method: req.body.paymentMethod });
    res.json({ message: 'Demo fine settled', demo: true, fine, receiptId: fine.receiptNumber });
  } catch (error) {
    if (!error.status) console.error('Demo settlement failed:', error.message);
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Demo settlement failed' });
  }
});

// POST /api/fines - Create a fine (staff only)
router.post("/", authenticate, authorize('staff', 'admin'), validateFineCreation, async (req, res) => {
  try {
    const { userId, itemId, borrowalId, reason, amount, description } = req.body;

    const fine = new Fine({
      user: userId,
      item: itemId,
      borrowal: borrowalId,
      reason,
      amount,
      description,
      issuedBy: req.userId
    });

    await fine.save();

    try {
      await createNotification({
        userId,
        type: 'fine',
        title: 'New fine issued',
        message: `A fine of $${Number(amount).toFixed(2)} was issued for ${reason}.`,
        relatedItem: itemId,
        relatedBorrowal: borrowalId,
        sendEmailNotification: true,
      });
    } catch (notifyErr) {
      console.error('Fine creation notification failed:', notifyErr);
    }

    res.status(201).json({
      message: 'Fine created successfully',
      fine: await fine.populate(['user', 'item', 'borrowal'])
    });
  } catch (error) {
    console.error('Error creating fine:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create fine' });
  }
});

module.exports = router;
