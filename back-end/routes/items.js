const express = require("express");
const router = express.Router();
const Item = require('../models/Item');
const Facility = require('../models/Facility');
const Borrowal = require('../models/Borrowal');
const Reservation = require('../models/Reservation');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validateItemCreation, validateItemUpdate, validateMongoId, validatePagination } = require('../middleware/validation');

// Helper to get validateMongoId middleware for 'id' param
const validateId = validateMongoId('id');
const availableQuantity = (item, total, borrowed, reserved) => ['maintenance', 'retired'].includes(item.status) ? 0 : Math.max(0, total - borrowed - reserved);

// GET /api/items - Get all items with optional filtering and pagination
router.get("/", optionalAuth, validatePagination, async (req, res) => {
  try {
    const {
      category,
      facility,
      status,
      search,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (facility && facility !== 'All') {
      query.facility = facility;
    }

    if (status && status !== 'All') {
      query.status = status === 'Available' ? 'available' :
                     status === 'Reserved' ? 'reserved' :
                     status.toLowerCase();
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const items = await Item.find(query)
      .populate('facility', 'name location')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Item.countDocuments(query);

    // Compute availableQuantity for each item based on active borrowals/reservations
    const itemsWithQuantity = await Promise.all(items.map(async (item) => {
      const itemObj = item.toObject();
      const totalQty = itemObj.quantity ?? 1;

      // Count active borrowals for this item
      const activeBorrowals = await Borrowal.countDocuments({
        item: item._id,
        status: { $in: ['active', 'overdue'] }
      });

      // Count active reservations for this item
      const activeReservations = await Reservation.countDocuments({
        item: item._id,
        status: { $in: ['pending', 'confirmed'] },
        pickupDate: { $lte: new Date() },
        expiryDate: { $gt: new Date() }
      });

      const availableQty = availableQuantity(item, totalQty, activeBorrowals, activeReservations);

      return {
        ...itemObj,
        quantity: totalQty,
        availableQuantity: availableQty
      };
    }));

    // Get distinct categories and facilities for filters
    const categories = await Item.distinct('category');
    const facilities = await Facility.find({ isActive: true }).select('_id name');

    const filters = {
      categories: ['All', ...categories],
      facilities: ['All', ...facilities.map(f => f.name)],
      availabilities: ['All', 'Available', 'Reserved', 'Checked-out', 'Maintenance']
    };

    res.json({
      items: itemsWithQuantity,
      filters,
      facilities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch items'
    });
  }
});

// GET /api/items/:id - Get single item by ID
router.get("/:id", validateId, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('facility', 'name location contactEmail contactPhone operatingHours');

    if (!item || !item.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Item not found'
      });
    }

    // Compute availableQuantity
    const totalQty = item.quantity ?? 1;
    const activeBorrowals = await Borrowal.countDocuments({
      item: item._id,
      status: { $in: ['active', 'overdue'] }
    });
    const activeReservations = await Reservation.countDocuments({
      item: item._id,
      status: { $in: ['pending', 'confirmed'] },
        pickupDate: { $lte: new Date() },
        expiryDate: { $gt: new Date() }
    });
    const availableQty = availableQuantity(item, totalQty, activeBorrowals, activeReservations);

    const itemObj = item.toObject();
    res.json({
      ...itemObj,
      quantity: totalQty,
      availableQuantity: availableQty
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch item'
    });
  }
});

// GET /api/items/facility/:name - Get items by facility name
router.get("/facility/:name", async (req, res) => {
  try {
    const facilityName = req.params.name.replace(/-/g, ' ');
    const facility = await Facility.findOne({
      name: new RegExp(facilityName, 'i'),
      isActive: true
    });

    if (!facility) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Facility not found'
      });
    }

    const items = await Item.find({
      facility: facility._id,
      isActive: true
    }).populate('facility', 'name location');

    res.json(items);
  } catch (error) {
    console.error('Error fetching items by facility:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch items'
    });
  }
});

// POST /api/items - Create new item (staff/admin only)
router.post("/", authenticate, authorize('staff', 'admin'), validateItemCreation, async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    await item.populate('facility', 'name location');

    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create item'
    });
  }
});

// PUT /api/items/:id - Update item (staff/admin only)
router.put("/:id", authenticate, authorize('staff', 'admin'), validateItemUpdate, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    ).populate('facility', 'name location');

    if (!item) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Item not found'
      });
    }

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update item'
    });
  }
});

// DELETE /api/items/:id - Soft delete item (staff/admin only)
router.delete("/:id", authenticate, authorize('staff', 'admin'), validateId, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: 'after' }
    );

    if (!item) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Item not found'
      });
    }

    res.json({
      message: 'Item deleted successfully',
      item
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete item'
    });
  }
});

// GET /api/items/:id/suggested - Get related/suggested items based on category and tags
router.get("/:id/suggested", optionalAuth, validateId, validatePagination, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    // Get the original item
    const originalItem = await Item.findById(id);
    if (!originalItem) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Item not found'
      });
    }

    // Find related items: same category, same facility, or matching tags
    // Exclude the original item
    const query = {
      _id: { $ne: id },
      isActive: true,
      status: 'available',
      $or: [
        { category: originalItem.category },
        { facility: originalItem.facility },
        { tags: { $in: originalItem.tags || [] } }
      ]
    };

    // Get suggested items, prioritizing same category
    let suggestedItems = await Item.find(query)
      .populate('facility', 'name location')
      .limit(parseInt(limit) * 2) // Get more to allow sorting
      .sort({ category: 1, createdAt: -1 });

    // Score and sort suggestions
    suggestedItems = suggestedItems.map(item => {
      let score = 0;
      if (item.category === originalItem.category) score += 3;
      if (item.facility?.toString() === originalItem.facility?.toString()) score += 2;
      if (item.tags?.some(tag => originalItem.tags?.includes(tag))) score += 1;
      return { ...item.toObject(), relevanceScore: score };
    });

    // Sort by relevance score and limit
    suggestedItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
    suggestedItems = suggestedItems.slice(0, parseInt(limit));

    // Compute availability for each suggested item
    const suggestionsWithAvailability = await Promise.all(suggestedItems.map(async (item) => {
      const totalQty = item.quantity ?? 1;
      const activeBorrowals = await Borrowal.countDocuments({
        item: item._id,
        status: { $in: ['active', 'overdue'] }
      });
      const activeReservations = await Reservation.countDocuments({
        item: item._id,
        status: { $in: ['pending', 'confirmed'] },
        pickupDate: { $lte: new Date() },
        expiryDate: { $gt: new Date() }
      });
      const availableQty = availableQuantity(item, totalQty, activeBorrowals, activeReservations);

      return {
        id: item._id,
        name: item.name,
        category: item.category,
        facility: item.facility?.name || 'Unknown',
        facilityId: item.facility?._id,
        imageUrl: item.imageUrl,
        status: availableQty > 0 ? 'available' : 'unavailable',
        quantity: totalQty,
        availableQuantity: availableQty,
        description: item.description?.substring(0, 100) + (item.description?.length > 100 ? '...' : ''),
        relevanceScore: item.relevanceScore
      };
    }));

    res.json({
      originalItem: {
        id: originalItem._id,
        name: originalItem.name,
        category: originalItem.category
      },
      suggestions: suggestionsWithAvailability
    });
  } catch (error) {
    console.error('Error getting suggested items:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get suggested items'
    });
  }
});

module.exports = router;

// [Task #502] Update: Modify item management routes
