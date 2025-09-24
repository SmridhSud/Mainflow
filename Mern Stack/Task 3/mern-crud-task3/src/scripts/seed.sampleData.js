/**
 * seed.sampleData.js
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const sampleUsers = [
  { name: 'Alice Smith', email: 'alice@example.com', age: 28, role: 'user' },
  { name: 'Bob Johnson', email: 'bob@example.com', age: 35, role: 'manager' },
  { name: 'Carlos Gomez', email: 'carlos@example.com', age: 22, role: 'user' },
  { name: 'Diana Prince', email: 'diana@example.com', age: 30, role: 'admin' },
  { name: 'Eve Adams', email: 'eve@example.com', age: 41, role: 'user' },
  { name: 'Frank Miller', email: 'frank@example.com', age: 19, role: 'guest' },
  { name: 'Grace Lee', email: 'grace@example.com', age: 29, role: 'user' },
  { name: 'Hannah Scott', email: 'hannah@example.com', age: 55, role: 'manager' },
  { name: 'Ian Wright', email: 'ian@example.com', age: 45, role: 'user' },
  { name: 'Judy Kim', email: 'judy@example.com', age: 33, role: 'admin' },
  { name: 'Kyle Brown', email: 'kyle@example.com', age: 26, role: 'user' },
  { name: 'Liam Davis', email: 'liam@example.com', age: 60, role: 'guest' }
];

(async function seed() {
  try {
    await connectDB();
    // Optionally drop collection for a clean seed
    await User.collection.drop().catch(() => {});
    const inserted = await User.insertMany(sampleUsers, { ordered: false });
    logger.info(`Inserted ${inserted.length} users`);
    process.exit(0);
  } catch (err) {
    logger.error('Seeding error', err);
    process.exit(1);
  }
})();
