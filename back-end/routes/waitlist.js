const express = require('express');
const r = express.Router();
const Waitlist = require('../models/Waitlist');
const Item = require('../models/Item');
const { authenticate } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validation');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// GET /api/waitlist - Get user's waitlist entries
r.get('/', authenticate, async (req, res) => {
  try {
    // Get both 'waiting' and 'notified' entries (notified means item is available)
    const entries = await Waitlist.find({
      user: req.userId,
      status: { $in: ['waiting', 'notified'] }
    })
      .populate({
        path: 'item',
        select: 'name category facility imageUrl',
        populate: {
          path: 'facility',
          select: 'name location',
          model: 'Facility'
        }
      })
      .sort({ createdAt: -1 });

    const waitlist = entries
      .filter(e => e.item && e.item._id) // Filter out entries with deleted items
      .map(e => {
        try {
          // Handle facility - it might be populated object or ObjectId
          let facilityName = 'Unknown Facility';
          if (e.item && e.item.facility) {
            if (typeof e.item.facility === 'object' && e.item.facility !== null && e.item.facility.name) {
              facilityName = e.item.facility.name;
            }
          }

          return {
            id: e._id.toString(),
            itemId: e.item._id ? e.item._id.toString() : '',
            item: e.item.name || 'Unknown Item',
            position: e.position,
            addedAt: e.createdAt,
            facility: facilityName,
            status: e.status, // Include status so frontend can differentiate
            notifiedAt: e.notifiedAt
          };
        } catch (mapError) {
          console.error('Error mapping waitlist entry:', mapError, e);
          return null;
        }
      })
      .filter(e => e !== null); // Remove any null entries from mapping errors

    res.json({ waitlist });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch waitlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/waitlist
r.post('/', authenticate, body('itemId').isMongoId(), handleValidationErrors, async (req, res) => {
  try {
    const { itemId } = req.body || {};
    if (!itemId) return res.status(400).json({ error: 'Missing itemId' });

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: 'Item not found' });
    }

    // Check if user already on waitlist for this item
    const existing = await Waitlist.findOne({
      user: req.userId,
      item: itemId,
      status: 'waiting'
    });

    if (existing) {
      return res.status(400).json({ error: 'Bad Request', message: 'Already on waitlist for this item' });
    }

    // Get next position
    const maxPosition = await Waitlist.findOne({ item: itemId, status: 'waiting' })
      .sort({ position: -1 })
      .select('position');
    const position = (maxPosition?.position || 0) + 1;

    const waitlistEntry = new Waitlist({
      user: req.userId,
      item: itemId,
      position
    });

    await waitlistEntry.save();

    return res.status(201).json({
      ok: true,
      waitlistId: waitlistEntry._id,
      userId: req.userId,
      itemId,
      position
    });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to add to waitlist' });
  }
});

// DELETE /api/waitlist/:id - Remove from waitlist
r.delete('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const entry = await Waitlist.findOne({ _id: req.params.id, user: req.userId });

    if (!entry) {
      return res.status(404).json({ error: 'Not Found', message: 'Waitlist entry not found' });
    }

    entry.status = 'cancelled';
    await entry.save();

    // Update positions for remaining entries
    await Waitlist.updateMany(
      { item: entry.item, position: { $gt: entry.position }, status: 'waiting' },
      { $inc: { position: -1 } }
    );

    res.json({ message: 'Removed from waitlist', ok: true });
  } catch (error) {
    console.error('Error removing from waitlist:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to remove from waitlist' });
  }
});

module.exports = r;
