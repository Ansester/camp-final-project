const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
const Borrowal = require('../models/Borrowal');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const active = ['active', 'overdue'];
const reservable = ['pending', 'confirmed'];
const conditions = ['excellent', 'good', 'fair', 'poor', 'damaged', 'needs-repair'];

async function withItem(itemId, work) {
  if (!mongoose.isValidObjectId(itemId)) fail(400, 'Invalid item ID');
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const item = await Item.findOne({ _id: itemId, isActive: true }).session(session);
      if (!item) fail(404, 'Item not found');
      // Every stock-changing operation writes the same item first. Concurrent
      // transactions conflict and retry before reading bookings/borrowals.
      await Item.updateOne({ _id: item._id }, { $inc: { __v: 1 } }, { session });
      result = await work(item, session);
    });
    return result;
  } finally { await session.endSession(); }
}

async function checkout({ itemId, userId, dueDate, actorId }) {
  const due = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000);
  if (!mongoose.isValidObjectId(userId) || !Number.isFinite(due.getTime()) || due <= new Date()) fail(400, 'Valid user ID and future due date required');
  return withItem(itemId, async (item, session) => {
    const user = await User.findOne({ _id: userId, isActive: true }).session(session);
    if (!user) fail(404, 'User not found');
    if (['maintenance', 'retired'].includes(item.status)) fail(409, 'Item is not available for checkout');
    const borrowed = await Borrowal.countDocuments({ item: item._id, status: { $in: active } }).session(session);
    const total = item.quantity ?? 1;
    const overlapping = { item: item._id, status: { $in: reservable }, pickupDate: { $lt: due }, expiryDate: { $gt: new Date() } };
    const otherReservations = await Reservation.countDocuments({ ...overlapping, user: { $ne: user._id } }).session(session);
    if (borrowed + otherReservations >= total) fail(409, 'No units available; checked out or reserved by another user');
    const borrowal = new Borrowal({ user: userId, item: item._id, dueDate: due, checkedOutBy: actorId });
    await borrowal.save({ session });
    const reservation = await Reservation.findOne({ ...overlapping, user: userId }).sort({ pickupDate: 1 }).session(session);
    if (reservation) {
      reservation.status = 'picked-up'; reservation.fulfilledAt = new Date();
      await reservation.save({ session });
    }
    item.quantityAvailable = total - borrowed - 1;
    item.status = item.quantityAvailable === 0 ? 'checked-out' : 'available';
    await item.save({ session });
    await Notification.create([{ user: userId, type: 'borrowal', title: 'Item checked out', message: `Checked out ${item.name}.`, relatedItem: item._id, relatedBorrowal: borrowal._id }], { session });
    return borrowal;
  });
}

async function checkin({ itemId, userId, borrowalId, condition = 'good', notes, actorId }) {
  if (!conditions.includes(condition)) fail(400, 'Invalid return condition');
  if (borrowalId && !mongoose.isValidObjectId(borrowalId)) fail(400, 'Invalid borrowal ID');
  if (userId && !mongoose.isValidObjectId(userId)) fail(400, 'Invalid user ID');
  if (borrowalId) {
    const existing = await Borrowal.findById(borrowalId);
    if (!existing) fail(404, 'Borrowal not found');
    if (itemId && existing.item.toString() !== itemId.toString()) fail(400, 'Borrowal does not match item and user');
    itemId = existing.item;
  }
  return withItem(itemId, async (item, session) => {
    const borrowal = borrowalId
      ? await Borrowal.findById(borrowalId).session(session)
      : await Borrowal.findOne({ item: item._id, user: userId, status: { $in: active } }).session(session);
    if (!borrowal) fail(404, 'Active borrowal not found');
    if (userId && borrowal.user.toString() !== userId.toString()) fail(400, 'Borrowal does not match item and user');
    if (!active.includes(borrowal.status)) fail(409, 'Borrowal is not active');
    borrowal.status = 'returned'; borrowal.returnDate = new Date(); borrowal.checkedInBy = actorId;
    borrowal.conditionOnReturn = condition;
    if (typeof notes === 'string') borrowal.notes = notes;
    await borrowal.save({ session });
    const borrowed = await Borrowal.countDocuments({ item: item._id, status: { $in: active } }).session(session);
    item.quantityAvailable = Math.max(0, (item.quantity ?? 1) - borrowed);
    if (['damaged', 'needs-repair'].includes(condition)) { item.status = 'maintenance'; item.condition = condition; }
    else if (item.status !== 'maintenance') item.status = item.quantityAvailable > 0 ? 'available' : 'checked-out';
    await item.save({ session });
    await Notification.create([{ user: borrowal.user, type: 'borrowal', title: 'Return confirmed', message: `Returned ${item.name}.`, relatedItem: item._id, relatedBorrowal: borrowal._id }], { session });
    return { item, borrowal };
  });
}

async function reserve({ itemId, userId, pickupDate }) {
  const pickup = new Date(pickupDate);
  if (!Number.isFinite(pickup.getTime()) || pickup < new Date(Date.now() - 5 * 60000)) fail(400, 'Valid future pickup date required');
  const expiry = new Date(pickup.getTime() + 86400000);
  return withItem(itemId, async (item, session) => {
    if (['maintenance', 'retired'].includes(item.status)) fail(409, 'Item is not available for reservation');
    const conflicts = { item: item._id, status: { $in: reservable }, pickupDate: { $lt: expiry }, expiryDate: { $gt: pickup } };
    if (await Reservation.exists({ ...conflicts, user: userId }).session(session)) fail(409, 'You already reserved this item for this time');
    const booked = await Reservation.countDocuments(conflicts).session(session);
    const borrowed = await Borrowal.countDocuments({ item: item._id, status: { $in: active } }).session(session);
    if (booked + borrowed >= (item.quantity ?? 1)) fail(409, 'No units available for this time slot');
    const reservation = new Reservation({ user: userId, item: item._id, reservationDate: new Date(), pickupDate: pickup, expiryDate: expiry, status: 'confirmed' });
    await reservation.save({ session });
    await Notification.create([{ user: userId, type: 'reservation', title: 'Reservation confirmed', message: `Reserved ${item.name}.`, relatedItem: item._id, relatedReservation: reservation._id }], { session });
    return reservation;
  });
}

async function cancelReservation({ id, actorId, role }) {
  const existing = await Reservation.findById(id);
  if (!existing) fail(404, 'Reservation not found');
  return withItem(existing.item, async (_item, session) => {
    const reservation = await Reservation.findById(id).session(session);
    if (reservation.user.toString() !== actorId.toString() && !['staff', 'admin'].includes(role)) fail(403, 'Access denied');
    if (!reservable.includes(reservation.status)) fail(409, 'Only pending or confirmed reservations can be cancelled');
    reservation.status = 'cancelled'; reservation.cancelledAt = new Date(); reservation.cancelledBy = actorId;
    await reservation.save({ session });
    await Notification.create([{ user: reservation.user, type: 'reservation', title: 'Reservation cancelled', message: 'Your reservation was cancelled.', relatedItem: reservation.item, relatedReservation: reservation._id }], { session });
    return reservation;
  });
}
module.exports = { checkout, checkin, reserve, cancelReservation };
