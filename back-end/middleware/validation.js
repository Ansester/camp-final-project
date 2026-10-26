const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }

  next();
};

/**
 * User validation rules
 */
const validateUserRegistration = [
  body('netId')
    .trim()
    .notEmpty().withMessage('NetID is required')
    .isLength({ min: 2, max: 20 }).withMessage('NetID must be 2-20 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required'),
  body('role')
    .optional()
    .equals('student').withMessage('Public registration only creates student accounts'),
  handleValidationErrors,
];

const validateUserLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Item validation rules
 */
const validateItemCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Camera', 'Audio', 'Lighting', 'Computer', 'Accessory', 'Lab Equipment', 'Sports Gear', 'Musical Instrument', 'Other'])
    .withMessage('Invalid category'),
  body('facility')
    .notEmpty().withMessage('Facility is required')
    .isMongoId().withMessage('Invalid facility ID'),
  body('condition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor', 'damaged', 'needs-repair']).withMessage('Invalid condition'),
  handleValidationErrors,
];

const validateItemUpdate = [
  param('id').isMongoId().withMessage('Invalid item ID'),
  body('name').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['Camera', 'Audio', 'Lighting', 'Computer', 'Accessory', 'Lab Equipment', 'Sports Gear', 'Musical Instrument', 'Other']),
  body('status').optional().isIn(['available', 'checked-out', 'reserved', 'maintenance', 'retired']),
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor', 'damaged', 'needs-repair']),
  handleValidationErrors,
];

/**
 * Borrowal validation rules
 */
const validateBorrowalCreation = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  body('itemId')
    .notEmpty().withMessage('Item ID is required')
    .isMongoId().withMessage('Invalid item ID'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  handleValidationErrors,
];

const validateBorrowalReturn = [
  param('id').isMongoId().withMessage('Invalid borrowal ID'),
  body('conditionOnReturn')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor', 'damaged']).withMessage('Invalid condition'),
  handleValidationErrors,
];

/**
 * Reservation validation rules
 */
const validateReservationCreation = [
  body('itemId')
    .notEmpty().withMessage('Item ID is required')
    .isMongoId().withMessage('Invalid item ID'),
  body('pickupDate')
    .notEmpty().withMessage('Pickup date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const pickupTime = new Date(value).getTime();
      const now = Date.now();
      // Allow a 5-minute grace period for clock differences
      if (pickupTime < now - 5 * 60 * 1000) {
        throw new Error('Pickup date must be in the future');
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Fine validation rules
 */
const validateFineCreation = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('reason')
    .notEmpty().withMessage('Reason is required')
    .isIn(['late-return', 'damage', 'loss', 'other']).withMessage('Invalid reason'),
  handleValidationErrors,
];

/**
 * ID validation - flexible for any param name
 * Can be used as validateMongoId() for default 'id' param
 * or validateMongoId('customParam') for custom param names
 */
const validateMongoId = (paramName = 'id') => {
  // If called with a string, return the validation middleware array
  if (typeof paramName === 'string') {
    return [
      param(paramName).isMongoId().withMessage('Invalid ID format'),
      handleValidationErrors,
    ];
  }
  // If called without arguments (as middleware directly), use default 'id'
  return [
    param('id').isMongoId().withMessage('Invalid ID format'),
    handleValidationErrors,
  ];
};

// Create a pre-built validator for the common 'id' param case
const validateIdParam = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors,
];

/**
 * Pagination validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateItemCreation,
  validateItemUpdate,
  validateBorrowalCreation,
  validateBorrowalReturn,
  validateReservationCreation,
  validateFineCreation,
  validateMongoId,
  validateIdParam,
  validatePagination,
};
