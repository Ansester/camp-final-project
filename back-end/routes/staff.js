const express = require('express');
const r = express.Router();
const Item = require('../models/Item');
const Borrowal = require('../models/Borrowal');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Fine = require('../models/Fine');
const { authenticate, authorize } = require('../middleware/auth');
const { validateItemCreation, validateBorrowalCreation, validateMongoId, validatePagination } = require('../middleware/validation');

// All staff routes require staff or admin role
r.use(authenticate, authorize('staff', 'admin'));

// GET /api/staff/students/search - Search for students and get their borrowals
r.get('/students/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    // Search users by name, email, or netId
    const users = await User.find({
      role: 'student',
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { netId: searchRegex }
      ]
    })
    .select('firstName lastName email netId')
    .limit(20);

    // For each user, get their active borrowals
    const results = await Promise.all(users.map(async (user) => {
      const borrowals = await Borrowal.find({
        user: user._id,
        status: { $in: ['active', 'overdue'] }
      })
      .populate('item', 'name assetId category')
      .populate({
        path: 'item',
        populate: { path: 'facility', select: 'name' }
      })
      .sort({ checkoutDate: -1 });

      return {
        student: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          netId: user.netId
        },
        borrowals: borrowals.map(b => ({
          id: b._id,
          item: {
            id: b.item?._id,
            name: b.item?.name || 'Unknown Item',
            assetId: b.item?.assetId,
            category: b.item?.category
          },
          facility: b.item?.facility?.name || 'Unknown',
          checkoutDate: b.checkoutDate ? b.checkoutDate.toISOString() : null,
          dueDate: b.dueDate ? b.dueDate.toISOString() : null,
          status: b.status,
          daysOverdue: b.daysOverdue || 0
        })),
        activeBorrowalsCount: borrowals.length
      };
    }));

    return res.status(200).json({
      students: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search students'
    });
  }
});

// GET /api/staff/students/:userId/borrowals - Get a specific student's borrowals
r.get('/students/:userId/borrowals', validateMongoId('userId'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('firstName lastName email netId role');
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'Student not found' });
    }

    if (user.role !== 'student') {
      return res.status(400).json({ error: 'Bad Request', message: 'User is not a student' });
    }

    // Get all borrowals (active, overdue, and history)
    const activeBorrowals = await Borrowal.find({
      user: userId,
      status: { $in: ['active', 'overdue'] }
    })
    .populate('item', 'name assetId category')
    .populate({
      path: 'item',
      populate: { path: 'facility', select: 'name' }
    })
    .sort({ checkoutDate: -1 });

    const returnedBorrowals = await Borrowal.find({
      user: userId,
      status: 'returned'
    })
    .populate('item', 'name assetId category')
    .populate({
      path: 'item',
      populate: { path: 'facility', select: 'name' }
    })
    .sort({ returnDate: -1 })
    .limit(10);

    return res.status(200).json({
      student: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        netId: user.netId
      },
      active: activeBorrowals.map(b => ({
        id: b._id,
        item: {
          id: b.item?._id,
          name: b.item?.name || 'Unknown Item',
          assetId: b.item?.assetId,
          category: b.item?.category
        },
        facility: b.item?.facility?.name || 'Unknown',
        checkoutDate: b.checkoutDate ? b.checkoutDate.toISOString() : null,
        dueDate: b.dueDate ? b.dueDate.toISOString() : null,
        status: b.status,
        daysOverdue: b.daysOverdue || 0
      })),
      history: returnedBorrowals.map(b => ({
        id: b._id,
        item: {
          id: b.item?._id,
          name: b.item?.name || 'Unknown Item',
          assetId: b.item?.assetId,
          category: b.item?.category
        },
        facility: b.item?.facility?.name || 'Unknown',
        checkoutDate: b.checkoutDate ? b.checkoutDate.toISOString() : null,
        returnDate: b.returnDate ? b.returnDate.toISOString() : null
      }))
    });
  } catch (error) {
    console.error('Error fetching student borrowals:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch student borrowals'
    });
  }
});

// GET /api/staff/inventory
r.get('/inventory', validatePagination, async (req, res) => {
  try {
    const { status, category, facility, page = 1, limit = 50, search } = req.query;

    const query = { isActive: true };
    if (status) query.status = status;
    if (category) query.category = category;
    if (facility) {
      // Find facility by name
      const Facility = require('../models/Facility');
      const facilityDoc = await Facility.findOne({
        name: new RegExp(`^${facility}$`, 'i')
      });
      if (facilityDoc) query.facility = facilityDoc._id;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const items = await Item.find(query)
      .populate('facility', 'name location')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    // Compute availableQuantity for each item
    const results = await Promise.all(items.map(async (item) => {
      const totalQty = item.quantity ?? 1;

      // Count active borrowals for this item
      const activeBorrowals = await Borrowal.countDocuments({
        item: item._id,
        status: { $in: ['active', 'overdue'] }
      });

      // Show physical stock separately from reservation commitments.
      // Checkout also checks overlapping reservations for the selected borrower.
      const availableQty = Math.max(0, totalQty - activeBorrowals);

      // Also provide reservation count for reference
      const activeReservations = await Reservation.countDocuments({
        item: item._id,
        status: { $in: ['pending', 'confirmed'] },
        expiryDate: { $gt: new Date() }
      });

      return {
        id: item._id,
        name: item.name,
        location: item.facility?.name || 'Unknown',
        assetId: item.assetId || `ID ${item.category.substring(0, 3).toUpperCase()}-${item._id.toString().slice(-3)}`,
        status: item.status,
        category: item.category,
        quantity: totalQty,
        availableQuantity: availableQty,
        reservedQuantity: activeReservations,
        condition: item.condition || 'Good',
        reservationWindow: 24,
        description: item.description
      };
    }));

    const total = await Item.countDocuments(query);

    return res.status(200).json({
      items: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch inventory' });
  }
});

// POST /api/staff/items
r.post('/items', validateItemCreation, async (req, res) => {
  try {
    const { name, category, facility, status, description, assetId, condition, quantity } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Missing name' });

    // Find facility by ID or name
    const Facility = require('../models/Facility');
    const mongoose = require('mongoose');
    let facilityDoc;

    if (mongoose.Types.ObjectId.isValid(facility)) {
      // Try to find by ID first
      facilityDoc = await Facility.findById(facility);
    }
    if (!facilityDoc && facility) {
      // Try to find by name
      facilityDoc = await Facility.findOne({ name: facility });
    }
    if (!facilityDoc) {
      return res.status(400).json({ error: 'Facility not found' });
    }

    const item = new Item({
      name,
      category: category || 'Other',
      facility: facilityDoc ? facilityDoc._id : undefined,
      status: status || 'available',
      description,
      assetId,
      condition: condition || 'good',
      quantity: quantity ?? 1
    });

    await item.save();

    return res.status(201).json({
      ok: true,
      id: item._id,
      name: item.name,
      category: item.category,
      facility: facilityDoc?.name,
      status: item.status
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create item' });
  }
});

const inventory = require('../utils/inventory');
r.post('/checkout', validateBorrowalCreation, async (req, res) => {
  try {
    const borrowal = await inventory.checkout({ ...req.body, actorId: req.userId });
    await borrowal.populate([{ path: 'item', select: 'name assetId facility quantity quantityAvailable', populate: { path: 'facility', select: 'name location' } }, { path: 'user', select: 'firstName lastName netId email' }]);
    res.status(201).json({ ok: true, borrowal, student: { id: borrowal.user._id, name: borrowal.user.fullName, netId: borrowal.user.netId, email: borrowal.user.email } });
  } catch (error) { res.status(error.status || 500).json({ error: error.status ? error.message : 'Checkout failed' }); }
});
r.post('/checkin', async (req, res) => {
  try {
    if (!req.body.itemId || (!req.body.userId && !req.body.borrowalId)) return res.status(400).json({ error: 'itemId and userId or borrowalId are required' });
    const { item } = await inventory.checkin({ ...req.body, actorId: req.userId });
    res.status(201).json({ ok: true, itemId: item._id, status: item.status, quantity: item.quantity, quantityAvailable: item.quantityAvailable });
  } catch (error) { res.status(error.status || 500).json({ error: error.status ? error.message : 'Return failed' }); }
});

// GET /api/staff/reservations
r.get('/reservations', validatePagination, async (req, res) => {
  try {
    const { status, facility, page = 1, limit = 50 } = req.query;

    const query = {};
    // By default, only show active reservations (pending/confirmed)
    // Exclude picked-up, fulfilled, cancelled, expired
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['pending', 'confirmed'] };
    }
    if (facility) {
      const Facility = require('../models/Facility');
      const facilityDoc = await Facility.findOne({ name: new RegExp(`^${facility}$`, 'i') });
      if (facilityDoc) {
        const itemIds = await Item.find({ facility: facilityDoc._id }).distinct('_id');
        query.item = { $in: itemIds.length ? itemIds : [null] };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reservations = await Reservation.find(query)
      .populate('user', 'firstName lastName')
      .populate({
        path: 'item',
        select: 'name facility',
        populate: { path: 'facility', select: 'name' }
      })
      .sort({ pickupDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const results = reservations.map(r => {
      const pickupAt = r.pickupDate || r.pickupTime || r.reservationDate;
      return {
        id: r._id,
        userId: r.user?._id,
        itemId: r.item?._id,
        item: r.item?.name || 'Unknown item',
        date: pickupAt
          ? pickupAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'TBD',
        time: pickupAt
          ? pickupAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          : 'TBD',
        pickupDate: pickupAt ? pickupAt.toISOString() : null,
        student: r.user ? `${r.user.firstName} ${r.user.lastName?.charAt(0) || ''}.` : 'Unknown',
        location: r.item?.facility?.name || r.facility?.name || 'Facility',
        status: r.status
      };
    });

    const total = await Reservation.countDocuments(query);

    return res.status(200).json({
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

// GET /api/staff/borrowals/active - Get all active borrowals
r.get('/borrowals/active', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, itemId } = req.query;

    const query = { status: { $in: ['active', 'overdue'] } };
    if (itemId) query.item = itemId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const borrowals = await Borrowal.find(query)
      .populate('user', 'firstName lastName netId email')
      .populate('item', 'name assetId')
      .sort({ checkoutDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const results = borrowals.map(b => ({
      id: b._id,
      borrowalId: b._id,
      student: {
        id: b.user?._id,
        name: b.user ? `${b.user.firstName} ${b.user.lastName}` : 'Unknown',
        netId: b.user?.netId,
        email: b.user?.email
      },
      item: {
        id: b.item?._id,
        name: b.item?.name || 'Unknown Item',
        assetId: b.item?.assetId
      },
      checkoutDate: b.checkoutDate ? b.checkoutDate.toISOString() : null,
      dueDate: b.dueDate ? b.dueDate.toISOString() : null,
      status: b.status,
      daysOverdue: b.daysOverdue || 0
    }));

    const total = await Borrowal.countDocuments(query);

    return res.status(200).json({
      borrowals: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching active borrowals:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch active borrowals' });
  }
});

// GET /api/staff/overdue
r.get('/overdue', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const borrowals = await Borrowal.find({ status: 'overdue' })
      .populate('user', 'firstName lastName')
      .populate('item', 'name')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const items = borrowals.map(b => ({
      id: b._id,
      odId: b._id.toString(),
      userId: b.user?._id?.toString(),
      itemId: b.item?._id?.toString(),
      item: b.item?.name || 'Unknown Item',
      days: b.daysOverdue || 0,
      student: b.user ? `${b.user.firstName?.charAt(0) || ''}. ${b.user.lastName || 'Unknown'}` : 'Unknown',
      dueDate: b.dueDate ? b.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
    }));

    const total = await Borrowal.countDocuments({ status: 'overdue' });

    return res.status(200).json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching overdue items:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch overdue items' });
  }
});

// GET /api/staff/alerts (staff dashboard statistics)
r.get('/alerts', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [available, out, reserved, checkoutsToday, returnsToday, overdue] = await Promise.all([
      Item.countDocuments({ status: 'available', isActive: true }),
      Item.countDocuments({ status: 'checked-out', isActive: true }),
      Item.countDocuments({ status: 'reserved', isActive: true }),
      Borrowal.countDocuments({
        checkoutDate: { $gte: todayStart }
      }),
      Borrowal.countDocuments({
        returnDate: { $gte: todayStart },
        status: 'returned'
      }),
      Borrowal.countDocuments({ status: 'overdue' })
    ]);

    const inventoryStats = {
      available,
      out,
      reserved,
      checkouts: checkoutsToday,
      returns: returnsToday,
      overdue
    };

    return res.status(200).json({ inventoryStats });
  } catch (error) {
    console.error('Error fetching staff alerts:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch stats' });
  }
});

// GET /api/staff/fines
r.get('/fines', validatePagination, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const fines = await Fine.find(query)
      .populate('user', 'firstName lastName netId email')
      .populate('item', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const results = fines.map(f => ({
      id: f._id,
      user: {
        name: `${f.user.firstName} ${f.user.lastName}`,
        netId: f.user.netId,
        email: f.user.email
      },
      item: f.item?.name,
      amount: f.amount,
      reason: f.reason,
      status: f.status,
      createdAt: f.createdAt,
      paidAt: f.paidDate
    }));

    const total = await Fine.countDocuments(query);

    return res.status(200).json({
      fines: results,
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

module.exports = r;
