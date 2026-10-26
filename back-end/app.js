const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { generalLimiter } = require('./middleware/rateLimiter');
const mongoose = require('mongoose');

const app = express();

// Trust proxy - needed when behind nginx reverse proxy
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);

/* ---------- core middleware ---------- */
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3001' }));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Apply rate limiting to all API routes
app.use('/api/', generalLimiter);

/* ---------- health & root ---------- */
app.get('/api/health', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    ok: ready,
    service: 'camp-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) =>
  res.status(200).send('C.A.M.P. Backend API running successfully!')
);

/* ---------- feature routes ---------- */
// existing routes
const items = require('./routes/items');
const reservations = require('./routes/reservations');
const fines = require('./routes/fines');
const users = require('./routes/users');
const notifications = require('./routes/notifications');
const alerts = require('./routes/alerts');
const help = require('./routes/help');
const facilities = require('./routes/facilities');

// newly added routes to satisfy smoke.sh
const auth = require('./routes/auth');           // /api/auth/student/login
const waitlist = require('./routes/waitlist');   // /api/waitlist
const borrowals = require('./routes/borrowals'); // /api/borrowals
const payments = require('./routes/payments');   // /api/payments/..., /api/payments/history
const policies = require('./routes/policies');   // /api/policies
const staff = require('./routes/staff');         // /api/staff/...
const dashboard = require('./routes/dashboard'); // /api/dashboard

// mounts
app.use('/api/items', items);
app.use('/api/reservations', reservations);
app.use('/api/fines', fines);
app.use('/api/users', users);
app.use('/api/notifications', notifications);
app.use('/api/alerts', alerts);
app.use('/api/help', help);
app.use('/api/facilities', facilities);

app.use('/api/auth', auth);
app.use('/api/waitlist', waitlist);
app.use('/api/borrowals', borrowals);
app.use('/api/payments', payments);
app.use('/api/policies', policies);
app.use('/api/staff', staff);
app.use('/api/dashboard', dashboard);

/* ---------- 404 + error handlers ---------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: (err.status || 500) < 500 ? 'Bad Request' : 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Unexpected error' : err.message,
  });
});

module.exports = app;
