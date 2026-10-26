#!/usr/bin/env node
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const app = require('./app');
const { checkDueDateNotifications, checkWaitlistNotifications, applyOverdueFines } = require('./utils/notificationService');

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Set JWT_SECRET to a random value of at least 32 characters');
  await connectDB();
  const server = http.createServer(app);
  server.listen(process.env.PORT || 3000, () => console.log('CAMP API listening'));
  let running = false;
  const check = async () => {
    if (running) return;
    running = true;
    try {
      await checkDueDateNotifications();
      await checkWaitlistNotifications();
      await applyOverdueFines();
    } catch (error) {
      console.error('Scheduled CAMP check failed:', error.message);
    } finally { running = false; }
  };
  const timer = setInterval(check, 60 * 60 * 1000);
  const initial = setTimeout(check, 5000);
  const stop = () => {
    clearInterval(timer);
    clearTimeout(initial);
    server.close(() => mongoose.disconnect().then(() => process.exit(0)));
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  return server;
}
if (require.main === module) start().catch(error => {
  console.error('CAMP startup failed:', error.message);
  mongoose.disconnect().finally(() => { process.exitCode = 1; });
});
module.exports = { start };
