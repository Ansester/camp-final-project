const express = require("express");
const router = express.Router();
const Reservation = require('../models/Reservation');
const { authenticate } = require('../middleware/auth');
const { validateReservationCreation, validateMongoId, validatePagination } = require('../middleware/validation');

// Helper to get validateMongoId middleware for 'id' param
const validateId = validateMongoId('id');

// GET /api/reservations - Get user's reservations
router.get("/", authenticate, validatePagination, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { user: req.userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reservations = await Reservation.find(query)
      .populate({
        path: 'item',
        select: 'name category facility imageUrl quantity quantityAvailable',
        populate: { path: 'facility', select: 'name location' }
      })
      .sort({ pickupDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const results = reservations.map(r => ({
      id: r._id,
      user: req.userId,
      item: r.item ? {
        id: r.item._id,
        name: r.item.name,
        category: r.item.category,
        quantity: r.item.quantity ?? 1,
        quantityAvailable: r.item.quantityAvailable ?? r.item.quantity ?? 1
      } : null,
      itemName: r.item?.name || 'Unknown Item',
      pickupDate: r.pickupDate,
      date: r.pickupDate ? r.pickupDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
      time: r.pickupDate ? r.pickupDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD',
      facility: r.item?.facility ? {
        id: r.item.facility._id,
        name: r.item.facility.name,
        location: r.item.facility.location
      } : null,
      facilityName: r.item?.facility?.name || 'Facility',
      status: r.status,
      expiresAt: r.expiryDate
    }));

    const total = await Reservation.countDocuments(query);

    res.json({
      reservations: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch reservations' });
  }
});

const inventory = require('../utils/inventory');
router.post('/', authenticate, validateReservationCreation, async (req, res) => {
  try {
    const reservation = await inventory.reserve({ itemId: req.body.itemId, pickupDate: req.body.pickupDate, userId: req.userId });
    await reservation.populate({ path: 'item', select: 'name facility', populate: { path: 'facility', select: 'name location' } });
    res.status(201).json({ message: 'Reservation created successfully', reservation });
  } catch (error) { res.status(error.status || 500).json({ error: error.status ? error.message : 'Reservation failed' }); }
});

// GET /api/reservations/slots?facility=IM%20Lab&date=2025-10-20
router.get("/slots", authenticate, async (req, res) => {
  try {
    const { facility, date } = req.query;

    if (!facility || !date) {
      return res.status(400).json({ error: 'Bad Request', message: 'facility and date are required' });
    }

    // Generate next 3 days
    const startDate = new Date(date);
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Standard time blocks
    const timeBlocks = ["10:00-12:00", "14:00-16:00", "16:00-18:00"];

    res.status(200).json({ dates, timeBlocks });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch slots' });
  }
});

router.put('/:id/cancel', authenticate, validateId, async (req, res) => {
  try {
    const reservation = await inventory.cancelReservation({ id: req.params.id, actorId: req.userId, role: req.userRole });
    res.json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) { res.status(error.status || 500).json({ error: error.status ? error.message : 'Cancellation failed' }); }
});
module.exports = router;
