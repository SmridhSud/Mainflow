/**
 * archiveOldUsers.js
 * Move users older than a certain date or last updated threshold to 'users_archive'.
 * Run with: npm run archive
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

(async () => {
  try {
    await connectDB();

    // Example: archive users older than 50 years
    const filter = { age: { $gt: 50 }, deleted: false };

    const usersToArchive = await User.find(filter).lean();
    if (usersToArchive.length === 0) {
      logger.info('No users to archive');
      process.exit(0);
    }

    const archiveColl = mongoose.connection.collection('users_archive');

    // Insert into archive collection
    await archiveColl.insertMany(usersToArchive);

    // Soft-delete original users (or deleteMany if you want hard delete)
    await User.updateMany(filter, { $set: { deleted: true } });

    logger.info(`Archived ${usersToArchive.length} users`);
    process.exit(0);
  } catch (err) {
    logger.error('archive error', err);
    process.exit(1);
  }
})();
