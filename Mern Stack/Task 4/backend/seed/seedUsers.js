require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const seed = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await User.deleteMany({});

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
    const salt = await bcrypt.genSalt(saltRounds);

    const users = [
      { username: 'alice', email: 'alice@example.com', password: await bcrypt.hash('Password123!', salt), role: 'user' },
      { username: 'bob', email: 'bob@example.com', password: await bcrypt.hash('Secur3Pass!', salt), role: 'admin' }
    ];

    await User.insertMany(users);
    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
