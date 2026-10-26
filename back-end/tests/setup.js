// Always creates its own disposable local database. Never reads .env or MONGODB_URI.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'camp-tests-only-not-a-deployment-secret-0123456789';
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
let database;
exports.mochaHooks = {
  async beforeAll() {
    this.timeout(180000);
    if (mongoose.connection.readyState !== 0) throw new Error('Tests must start disconnected');
    database = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ ip: '127.0.0.1' }] });
    await mongoose.connect(database.getUri('camp_test'));
    await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  },
  async beforeEach() {
    if (!database || mongoose.connection.name !== 'camp_test') throw new Error('Refusing to clear an unowned database');
    await Promise.all(Object.values(mongoose.models).map(model => model.deleteMany({})));
  },
  async afterAll() {
    await mongoose.disconnect();
    if (database) await database.stop();
  },
};
