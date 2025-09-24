// config/database.js
const mongoose = require('mongoose');

const connectDB = async (mongoUri, opts = {}) => {
  if (!mongoUri) throw new Error('MONGO_URI is required');

  const defaultOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // poolSize etc can be tuned for production
  };

  try {
    await mongoose.connect(mongoUri, { ...defaultOpts, ...opts });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }

  // Handle graceful shutdown
  const graceful = async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  };

  process.on('SIGINT', graceful);
  process.on('SIGTERM', graceful);

  return mongoose.connection;
};

module.exports = connectDB;
