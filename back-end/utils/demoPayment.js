const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const Fine = require('../models/Fine');
const User = require('../models/User');

// Coursework ledger only. No connection to NYU Campus Cash or a payment provider.
async function settleDemoFine({ fineId, userId, method }) {
  if (!['campus-cash', 'demo-campus-cash'].includes(method)) {
    throw Object.assign(new Error('Only demo Campus Cash is supported; no real payments are processed'), { status: 400 });
  }
  const session = await mongoose.startSession();
  try {
    let paid;
    await session.withTransaction(async () => {
      const fine = await Fine.findById(fineId).session(session);
      if (!fine) throw Object.assign(new Error('Fine not found'), { status: 404 });
      if (fine.user.toString() !== userId.toString()) throw Object.assign(new Error('Access denied'), { status: 403 });
      if (fine.status !== 'pending') throw Object.assign(new Error('Only pending fines can be settled'), { status: 409 });
      const user = await User.findOneAndUpdate(
        { _id: userId, isActive: true, campusCashBalance: { $gte: fine.amount } },
        { $inc: { campusCashBalance: -fine.amount } },
        { returnDocument: 'after', session }
      );
      if (!user) throw Object.assign(new Error('Insufficient demo Campus Cash balance'), { status: 400 });
      fine.status = 'paid';
      fine.paidDate = new Date();
      fine.paymentMethod = 'demo-campus-cash';
      fine.receiptNumber = `DEMO-${randomUUID()}`;
      await fine.save({ session });
      paid = fine;
    });
    return paid;
  } finally { await session.endSession(); }
}
module.exports = { settleDemoFine };
