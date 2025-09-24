/**
 * bulkUpsertExample.js
 * Demonstrates using updateMany upsert and custom _id.
 * Run with: npm run upsert
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

(async () => {
  try {
    await connectDB();

    // Example: upsert based on email
    const operations = [
      {
        updateOne: {
          filter: { email: 'alice@example.com' },
          update: { $set: { name: 'Alice S.', role: 'user' } },
          upsert: true
        }
      },
      {
        updateOne: {
          filter: { email: 'newperson@example.com' },
          update: { $set: { name: 'New Person', age: 20, role: 'guest' } },
          upsert: true
        }
      }
    ];

    const res = await User.bulkWrite(operations, { ordered: false });
    logger.info('BulkWrite result', res);
    process.exit(0);
  } catch (err) {
    logger.error('bulkUpsert error', err);
    process.exit(1);
  }
})();
