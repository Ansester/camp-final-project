const r = require('express').Router();
const Fine = require('../models/Fine');
const { authenticate } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validation');
const { settleDemoFine } = require('../utils/demoPayment');

r.post('/:fineId/pay', authenticate, validateMongoId('fineId'), async (req, res) => {
  try {
    const fine = await settleDemoFine({ fineId: req.params.fineId, userId: req.userId, method: req.body.method });
    res.status(201).json({ ok: true, demo: true, fineId: fine._id, receiptId: fine.receiptNumber, amount: fine.amount, paidAt: fine.paidDate });
  } catch (error) {
    if (!error.status) console.error('Demo settlement failed:', error.message);
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Demo settlement failed' });
  }
});
r.get('/history', authenticate, async (req, res) => {
  try {
    const fines = await Fine.find({ user: req.userId, status: 'paid' }).sort({ paidDate: -1 }).limit(50);
    res.json({ demo: true, payments: fines.map(f => ({
      id: f._id, receipt: f.receiptNumber || `DEMO-${f._id}`, amount: f.amount,
      date: f.paidDate ? f.paidDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
      method: 'Demo Campus Cash',
    })) });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch demo payment history' }); }
});
module.exports = r;
