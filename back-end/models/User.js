const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  netId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student',
  },
  phone: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
    default: null,
  },
  campusCashBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
    reminder: {
      startDaysBefore: { type: Number, min: 0, max: 30, default: 5 },
      frequency: { type: String, enum: ['daily', 'weekly', 'never'], default: 'daily' },
    },
  },
}, {
  timestamps: true,
});

// Additional non-unique index for role filtering (netId & email already unique indexes via schema definition)
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
