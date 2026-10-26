const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  borrowal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrowal',
    default: null,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    default: null,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  reason: {
    type: String,
    required: true,
    enum: ['late-return', 'damage', 'loss', 'other'],
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'waived', 'appealed'],
    default: 'pending',
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
  paidDate: {
    type: Date,
    default: null,
  },
  paymentMethod: { type: String, enum: ['demo-campus-cash'], default: null },
  receiptNumber: { type: String, default: null },
  waivedDate: {
    type: Date,
    default: null,
  },
  waivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  waiverReason: {
    type: String,
    default: '',
  },
  transactionId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
fineSchema.index({ user: 1, status: 1 });
fineSchema.index({ borrowal: 1 });
fineSchema.index({ issuedDate: -1 });

module.exports = mongoose.model('Fine', fineSchema);
