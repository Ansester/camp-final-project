const { expect } = require('chai');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Item = require('../models/Item');
const Facility = require('../models/Facility');
const Borrowal = require('../models/Borrowal');
const Fine = require('../models/Fine');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const { generateToken } = require('../utils/jwt');
let student, other, staff, facility, item;
const password = 'Coursework-test-password';
const auth = user => `Bearer ${generateToken(user._id, user.role)}`;
const registration = () => ({ netId: 'new001', email: 'new@example.test', password, firstName: 'New', lastName: 'Student' });
const post = (path, user, body) => request(app).post(path).set('Authorization', auth(user)).send(body);
beforeEach(async () => {
  const hashed = await bcrypt.hash(password, 4);
  [student, other, staff] = await User.create(['student', 'other', 'staff'].map((name, i) => ({ netId: `test${i}`, email: `${name}@example.test`, password: hashed, firstName: name, lastName: 'Test', role: name === 'staff' ? 'staff' : 'student', campusCashBalance: 100 })));
  facility = await Facility.create({ name: 'Test Lab', description: 'Synthetic fixture', location: { building: 'Test', room: '1' }, contactEmail: 'lab@example.test', contactPhone: '000' });
  item = await Item.create({ name: 'Fixture Camera', description: 'Synthetic fixture', category: 'Camera', facility: facility._id, quantity: 1, quantityAvailable: 1 });
});
describe('HTTP and public catalog contracts', () => {
  it('serves readiness and JSON 404s', async () => {
    expect((await request(app).get('/api/health')).body.ok).to.equal(true);
    expect((await request(app).get('/unknown')).status).to.equal(404);
  });
  it('returns MongoDB IDs, filters, details and facility bundles', async () => {
    const catalog = await request(app).get('/api/items');
    expect(catalog.status).to.equal(200);
    expect(catalog.body.items[0]._id).to.equal(item.id);
    expect(catalog.body.items[0].availableQuantity).to.equal(1);
    expect(catalog.body.facilities[0]._id).to.equal(facility.id);
    expect((await request(app).get(`/api/items/${item.id}`)).body._id).to.equal(item.id);
    expect((await request(app).get('/api/facilities/test-lab/items')).body.items).to.have.length(1);
  });
  it('counts confirmed current reservations', async () => {
    await Reservation.create({ user: student._id, item: item._id, reservationDate: new Date(), pickupDate: new Date(Date.now() - 60000), expiryDate: new Date(Date.now() + 60000), status: 'confirmed' });
    expect((await request(app).get(`/api/items/${item.id}`)).body.availableQuantity).to.equal(0);
  });
  it('validates malformed IDs/pagination and distinguishes missing IDs', async () => {
    expect((await request(app).get('/api/items/1')).status).to.equal(400);
    expect((await request(app).get(`/api/items/${new mongoose.Types.ObjectId()}`)).status).to.equal(404);
    expect((await request(app).get('/api/items?limit=0')).status).to.equal(400);
  });
  it('serves public policy/help/facility contracts', async () => {
    expect((await request(app).get('/api/policies')).body).to.have.property('borrowingPeriodDays');
    expect((await request(app).get('/api/help')).status).to.equal(200);
    expect((await request(app).get('/api/facilities')).body).to.be.an('array');
  });
});
describe('Authentication and authorization, including NODE_ENV=test', () => {
  it('registers students, hashes passwords and excludes passwords from responses', async () => {
    const res = await request(app).post('/api/auth/register').send(registration());
    expect(res.status).to.equal(201);
    expect(res.body.user.role).to.equal('student');
    expect(res.body.user).not.to.have.property('password');
    const saved = await User.findById(res.body.user._id);
    expect(saved.password).not.to.equal(password);
    expect(await bcrypt.compare(password, saved.password)).to.equal(true);
  });
  for (const role of ['staff', 'admin']) it(`rejects self-registration as ${role} without creating an account`, async () => {
    expect((await request(app).post('/api/auth/register').send({ ...registration(), role })).status).to.equal(400);
    expect(await User.countDocuments({ netId: 'new001' })).to.equal(0);
  });
  it('rejects duplicates and invalid inputs', async () => {
    expect((await request(app).post('/api/auth/register').send({ ...registration(), email: student.email })).status).to.equal(409);
    expect((await request(app).post('/api/auth/register').send({})).status).to.equal(400);
    expect((await request(app).post('/api/auth/login').send({ email: { $ne: null }, password })).status).to.equal(400);
  });
  it('logs in with normalized email and checks passwords and role-specific login', async () => {
    const ok = await request(app).post('/api/auth/student/login').send({ email: student.email.toUpperCase(), password });
    expect(ok.status).to.equal(200);
    expect(ok.body).to.have.property('token');
    expect((await request(app).post('/api/auth/login').send({ email: student.email, password: 'wrong' })).status).to.equal(401);
    expect((await request(app).post('/api/auth/staff/login').send({ email: student.email, password })).status).to.equal(401);
  });
  it('requires tokens across private route groups', async () => {
    for (const path of ['/api/fines', '/api/borrowals', '/api/reservations', '/api/waitlist', '/api/notifications', '/api/notifications/preferences', '/api/dashboard', '/api/payments/history', '/api/users', '/api/staff/inventory']) expect((await request(app).get(path)).status, path).to.equal(401);
  });
  it('rejects malformed, expired and forged tokens', async () => {
    for (const token of ['bogus', jwt.sign({ userId: student.id }, process.env.JWT_SECRET, { expiresIn: -1 }), jwt.sign({ userId: student.id }, 'wrong-secret')]) expect((await request(app).get('/api/dashboard').set('Authorization', `Bearer ${token}`)).status).to.equal(401);
  });
  it('uses persisted roles instead of the role claim in a JWT', async () => {
    expect((await request(app).get('/api/staff/inventory').set('Authorization', `Bearer ${generateToken(student.id, 'admin')}`)).status).to.equal(403);
    expect((await request(app).get('/api/staff/inventory').set('Authorization', auth(staff))).status).to.equal(200);
  });
  it('rejects inactive and deleted accounts with previously valid tokens', async () => {
    const token = auth(student); student.isActive = false; await student.save();
    expect((await request(app).get('/api/dashboard').set('Authorization', token)).status).to.equal(401);
    await User.deleteOne({ _id: student._id });
    expect((await request(app).get('/api/dashboard').set('Authorization', token)).status).to.equal(401);
  });
  it('denies students staff inventory, users, fines, funds and checkout operations', async () => {
    expect((await request(app).get('/api/users').set('Authorization', auth(student))).status).to.equal(403);
    for (const path of ['/api/items', '/api/fines', '/api/users/add-funds', '/api/staff/checkout']) expect((await post(path, student, {})).status, path).to.equal(403);
  });
  it('restricts profiles and ignores role and balance fields in profile updates', async () => {
    expect((await request(app).get(`/api/users/${other.id}`).set('Authorization', auth(student))).status).to.equal(403);
    expect((await request(app).put(`/api/users/${student.id}`).set('Authorization', auth(student)).send({ firstName: 'Changed', role: 'admin', campusCashBalance: 9999 })).status).to.equal(200);
    const saved = await User.findById(student.id);
    expect(saved.role).to.equal('student'); expect(saved.campusCashBalance).to.equal(100);
  });
});
describe('Student workflows and ownership', () => {
  it('reserves, detects conflicts, restricts cancellation and cancels', async () => {
    const data = { itemId: item.id, pickupDate: new Date(Date.now() + 3600000).toISOString() };
    const created = await post('/api/reservations', student, data);
    expect(created.status).to.equal(201);
    expect((await post('/api/reservations', other, data)).status).to.equal(409);
    const path = `/api/reservations/${created.body.reservation._id}/cancel`;
    expect((await request(app).put(path).set('Authorization', auth(other))).status).to.equal(403);
    expect((await request(app).put(path).set('Authorization', auth(student))).status).to.equal(200);
  });
  it('validates waitlist IDs and enforces removal ownership without hanging', async () => {
    expect((await post('/api/waitlist', student, { itemId: 'bad' })).status).to.equal(400);
    expect((await post('/api/waitlist', student, { itemId: item.id, userId: other.id })).status).to.equal(201);
    const own = await request(app).get('/api/waitlist').set('Authorization', auth(student));
    expect(own.body.waitlist).to.have.length(1);
    const id = own.body.waitlist[0].id;
    expect((await request(app).delete(`/api/waitlist/${id}`).set('Authorization', auth(other))).status).to.equal(404);
    expect((await request(app).delete(`/api/waitlist/${id}`).set('Authorization', auth(student))).status).to.equal(200);
  });
  it('persists preferences and preserves previous values during partial updates', async () => {
    const path = '/api/notifications/preferences';
    expect((await request(app).put(path).set('Authorization', auth(student)).send({ email: false, reminder: { startDaysBefore: 3 } })).status).to.equal(200);
    await request(app).put(path).set('Authorization', auth(student)).send({ sms: true });
    const saved = await request(app).get(path).set('Authorization', auth(student));
    expect(saved.body.email).to.equal(false); expect(saved.body.sms).to.equal(true); expect(saved.body.reminder.startDaysBefore).to.equal(3);
    const profile = await request(app).get(`/api/users/${student.id}`).set('Authorization', auth(student));
    expect(profile.body.student.notificationPreferences.email).to.equal(false);
    expect(profile.body.student.notificationPreferences.reminder.startDaysBefore).to.equal(3);
    expect((await request(app).put(path).set('Authorization', auth(student)).send({ reminder: { startDaysBefore: -4 } })).status).to.equal(400);
  });
  it('restricts notification updates to their owner', async () => {
    const note = await Notification.create({ user: student._id, type: 'general', title: 'Fixture', message: 'Owner-only fixture' });
    expect((await request(app).put(`/api/notifications/${note.id}/read`).set('Authorization', auth(other))).status).to.equal(404);
    expect((await request(app).put(`/api/notifications/${note.id}/read`).set('Authorization', auth(student))).status).to.equal(200);
  });
  it('ignores forged query userIds in fines, dashboard and borrowals', async () => {
    await Fine.create({ user: other._id, amount: 20, reason: 'other' });
    const fines = await request(app).get(`/api/fines?userId=${other.id}`).set('Authorization', auth(student));
    expect(fines.body.fines).to.have.length(0);
    const dashboard = await request(app).get(`/api/dashboard?userId=${other.id}`).set('Authorization', auth(student));
    expect(dashboard.body.stats.find(s => s.id === 'unpaidFines').value).to.equal(0);
    expect((await request(app).get(`/api/borrowals?userId=${other.id}`).set('Authorization', auth(student))).body).to.deep.equal({ current: [], history: [] });
  });
});
describe('Staff workflows', () => {
  it('creates an item with a real facility ID and rejects missing fields', async () => {
    expect((await post('/api/staff/items', staff, {})).status).to.equal(400);
    const res = await post('/api/items', staff, { name: 'Fixture Mic', description: 'Demo', category: 'Audio', facility: facility.id });
    expect(res.status).to.equal(201); expect(res.body.item.facility.name).to.equal(facility.name);
  });
  it('checks out, rejects mismatched returns, returns once and restores quantity', async () => {
    const checked = await post('/api/staff/checkout', staff, { userId: student.id, itemId: item.id });
    expect(checked.status).to.equal(201);
    const borrowalId = checked.body.borrowal._id;
    const another = await Item.create({ name: 'Other', description: 'Fixture', category: 'Audio', facility: facility._id });
    expect((await post('/api/staff/checkin', staff, { itemId: another.id, borrowalId })).status).to.equal(400);
    const returned = await post('/api/staff/checkin', staff, { itemId: item.id, borrowalId, userId: student.id });
    expect(returned.status).to.equal(201); expect(returned.body.quantityAvailable).to.equal(1);
    expect((await post('/api/staff/checkin', staff, { itemId: item.id, borrowalId })).status).to.equal(409);
    expect((await Borrowal.findById(borrowalId)).status).to.equal('returned');
  });
  it('rejects maintenance-equipment checkout', async () => {
    item.status = 'maintenance'; await item.save();
    expect((await post('/api/staff/checkout', staff, { userId: student.id, itemId: item.id })).status).to.equal(409);
  });
  it('returns staff bundles and properly populated overdue facility names', async () => {
    await Borrowal.create({ user: student._id, item: item._id, checkedOutBy: staff._id, dueDate: new Date(Date.now() - 86400000), status: 'overdue' });
    const res = await request(app).get('/api/borrowals/overdue').set('Authorization', auth(staff));
    expect(res.status).to.equal(200); expect(res.body.overdue[0].facility).to.equal(facility.name);
    expect((await request(app).get('/api/staff/fines').set('Authorization', auth(staff))).body.fines).to.be.an('array');
  });
});
describe('Transactional fictional payments: no payment provider', () => {
  let fine;
  beforeEach(async () => { fine = await Fine.create({ user: student._id, amount: 25, reason: 'other' }); });
  const pay = (user, id = fine.id, method = 'demo-campus-cash') => post(`/api/fines/${id}/pay`, user, { paymentMethod: method });
  it('rejects missing/unsupported payment methods without writes', async () => {
    expect((await post(`/api/fines/${fine.id}/pay`, student, {})).status).to.equal(400);
    expect((await pay(student, fine.id, 'credit-card')).status).to.equal(400);
    expect((await Fine.findById(fine.id)).status).to.equal('pending');
    expect((await User.findById(student.id)).campusCashBalance).to.equal(100);
  });
  it('rejects another student and staff on both payment URLs', async () => {
    for (const user of [other, staff]) {
      expect((await pay(user)).status).to.equal(403);
      expect((await post(`/api/payments/${fine.id}/pay`, user, { method: 'campus-cash' })).status).to.equal(403);
    }
  });
  it('persists receipt/date/method, debits once and returns payment history', async () => {
    const res = await pay(student); expect(res.status).to.equal(200); expect(res.body.demo).to.equal(true);
    const saved = await Fine.findById(fine.id);
    expect(saved.paidDate).to.be.a('date'); expect(saved.paymentMethod).to.equal('demo-campus-cash'); expect(saved.receiptNumber).to.match(/^DEMO-/);
    expect((await User.findById(student.id)).campusCashBalance).to.equal(75);
    expect((await pay(student)).status).to.equal(409);
    const history = await request(app).get('/api/payments/history').set('Authorization', auth(student));
    expect(history.body.payments[0].date).not.to.equal('N/A'); expect(history.body.payments[0].receipt).to.equal(saved.receiptNumber);
  });
  it('rolls back unchanged when the fictional balance is insufficient', async () => {
    await User.updateOne({ _id: student.id }, { campusCashBalance: 10 });
    expect((await pay(student)).status).to.equal(400);
    expect((await Fine.findById(fine.id)).status).to.equal('pending'); expect((await User.findById(student.id)).campusCashBalance).to.equal(10);
  });
  it('handles simultaneous submissions without double debit', async () => {
    const res = await Promise.all([pay(student), pay(student)]);
    expect(res.map(r => r.status).sort()).to.deep.equal([200, 409]); expect((await User.findById(student.id)).campusCashBalance).to.equal(75);
  });
  it('handles different simultaneous fines without overdrawing the balance', async () => {
    await User.updateOne({ _id: student.id }, { campusCashBalance: 30 });
    const second = await Fine.create({ user: student._id, amount: 25, reason: 'other' });
    const res = await Promise.all([pay(student), pay(student, second.id)]);
    expect(res.map(r => r.status).sort()).to.deep.equal([200, 400]); expect((await User.findById(student.id)).campusCashBalance).to.equal(5);
    expect(await Fine.countDocuments({ user: student.id, status: 'paid' })).to.equal(1);
  });
});

describe('Inventory transaction concurrency and rollback', () => {
  it('allows only one simultaneous overlapping reservation for the last unit', async () => {
    const data = { itemId: item.id, pickupDate: new Date(Date.now() + 3600000).toISOString() };
    const res = await Promise.all([post('/api/reservations', student, data), post('/api/reservations', other, data)]);
    expect(res.map(r => r.status).sort()).to.deep.equal([201, 409]);
    expect(await Reservation.countDocuments({ item: item.id })).to.equal(1);
  });
  it('shares capacity checks across simultaneous legacy and staff checkout aliases', async () => {
    const res = await Promise.all([
      post('/api/staff/checkout', staff, { itemId: item.id, userId: student.id }),
      post('/api/borrowals/checkout', staff, { itemId: item.id, userId: other.id }),
    ]);
    expect(res.map(r => r.status).sort()).to.deep.equal([201, 409]);
    expect(await Borrowal.countDocuments({ item: item.id, status: 'active' })).to.equal(1);
    expect((await Item.findById(item.id)).quantityAvailable).to.equal(0);
  });
  it('serializes a booking and a checkout competing for the last unit', async () => {
    const res = await Promise.all([
      post('/api/reservations', student, { itemId: item.id, pickupDate: new Date(Date.now() + 3600000).toISOString() }),
      post('/api/staff/checkout', staff, { itemId: item.id, userId: other.id }),
    ]);
    expect(res.map(r => r.status).sort()).to.deep.equal([201, 409]);
    expect(await Reservation.countDocuments({ item: item.id }) + await Borrowal.countDocuments({ item: item.id })).to.equal(1);
  });
  it('fulfills an owners reservation through checkout and prevents cancelling a picked-up reservation', async () => {
    const reservation = await post('/api/reservations', student, { itemId: item.id, pickupDate: new Date(Date.now() + 3600000).toISOString() });
    expect((await post('/api/staff/checkout', staff, { itemId: item.id, userId: student.id })).status).to.equal(201);
    const id = reservation.body.reservation._id;
    expect((await Reservation.findById(id)).status).to.equal('picked-up');
    expect((await request(app).put(`/api/reservations/${id}/cancel`).set('Authorization', auth(student))).status).to.equal(409);
  });
  it('returns only once across simultaneous legacy and staff return aliases', async () => {
    const checked = await post('/api/staff/checkout', staff, { itemId: item.id, userId: student.id });
    const id = checked.body.borrowal._id;
    const res = await Promise.all([
      post('/api/staff/checkin', staff, { itemId: item.id, borrowalId: id }),
      request(app).put(`/api/borrowals/${id}/return`).set('Authorization', auth(staff)).send({ condition: 'good' }),
    ]);
    expect(res.filter(r => r.status === 200 || r.status === 201)).to.have.length(1);
    expect(res.filter(r => r.status === 409)).to.have.length(1);
    expect((await Item.findById(item.id)).quantityAvailable).to.equal(1);
  });
  it('rolls back a checkout when the stock write fails after borrowal creation', async () => {
    const save = Item.prototype.save;
    Item.prototype.save = async function () { throw new Error('Injected stock write failure'); };
    try {
      expect((await post('/api/staff/checkout', staff, { itemId: item.id, userId: student.id })).status).to.equal(500);
    } finally { Item.prototype.save = save; }
    expect(await Borrowal.countDocuments({ item: item.id })).to.equal(0);
    expect((await Item.findById(item.id)).quantityAvailable).to.equal(1);
  });
  it('rolls back a return when the stock write fails after the borrowal update', async () => {
    const checked = await post('/api/staff/checkout', staff, { itemId: item.id, userId: student.id });
    const id = checked.body.borrowal._id;
    const save = Item.prototype.save;
    Item.prototype.save = async function () { throw new Error('Injected stock write failure'); };
    try { expect((await post('/api/staff/checkin', staff, { itemId: item.id, borrowalId: id })).status).to.equal(500); }
    finally { Item.prototype.save = save; }
    expect((await Borrowal.findById(id)).status).to.equal('active');
    expect((await Item.findById(item.id)).quantityAvailable).to.equal(0);
  });
  it('rolls back a failed reservation and leaves capacity usable', async () => {
    const save = Reservation.prototype.save;
    Reservation.prototype.save = async function () { throw new Error('Injected reservation write failure'); };
    const data = { itemId: item.id, pickupDate: new Date(Date.now() + 3600000).toISOString() };
    try { expect((await post('/api/reservations', student, data)).status).to.equal(500); }
    finally { Reservation.prototype.save = save; }
    expect(await Reservation.countDocuments({ item: item.id })).to.equal(0);
    expect((await post('/api/reservations', student, data)).status).to.equal(201);
  });
});

describe('Additional state consistency', () => {
  it('does not advertise maintenance or zero-stock items as reservable', async () => {
    item.status = 'maintenance'; await item.save();
    expect((await request(app).get(`/api/items/${item.id}`)).body.availableQuantity).to.equal(0);
    item.status = 'available'; item.quantity = 0; await item.save();
    expect((await request(app).get(`/api/items/${item.id}`)).body.availableQuantity).to.equal(0);
    expect((await post('/api/reservations', student, { itemId: item.id, pickupDate: new Date(Date.now() + 3600000).toISOString() })).status).to.equal(409);
  });
  it('adds concurrent fictional credits without losing an update', async () => {
    const res = await Promise.all([post('/api/users/add-funds', staff, { userId: student.id, amount: 10 }), post('/api/users/add-funds', staff, { userId: student.id, amount: 20 })]);
    expect(res.every(r => r.status === 200 && r.body.demo === true)).to.equal(true);
    expect((await User.findById(student.id)).campusCashBalance).to.equal(130);
  });
});

describe('Persisted scheduled reminder preferences', () => {
  it('uses the chosen lead time, deduplicates reminders, and honors disabling in-app alerts', async () => {
    await User.updateOne({ _id: student.id }, { $set: { 'notificationPreferences.reminder.startDaysBefore': 3 } });
    await Borrowal.create({ user: student.id, item: item.id, checkedOutBy: staff.id, dueDate: new Date(Date.now() + 2.9 * 86400000) });
    const { checkDueDateNotifications } = require('../utils/notificationService');
    await checkDueDateNotifications(); await checkDueDateNotifications();
    expect(await Notification.countDocuments({ user: student.id, type: 'reminder' })).to.equal(1);
    await Notification.deleteMany({});
    await User.updateOne({ _id: student.id }, { $set: { 'notificationPreferences.inApp': false } });
    await checkDueDateNotifications();
    expect(await Notification.countDocuments({ user: student.id, type: 'reminder' })).to.equal(0);
  });
});
