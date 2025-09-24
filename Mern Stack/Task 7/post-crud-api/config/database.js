const mongoose = require('mongoose');

const {
  MONGODB_URI = 'mongodb://127.0.0.1:27017/post-crud-api',
} = process.env;

const defaultOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // connection pool
  maxPoolSize: 10,
  // socket timeout
  socketTimeoutMS: 45000,
};

let isConnectedBefore = false;

const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    isConnectedBefore = true;
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  const connectWithRetry = async (retries = 5, delayMs = 2000) => {
    try {
      await mongoose.connect(MONGODB_URI, defaultOptions);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error(`MongoDB connection attempt failed (${5 - retries + 1}):`, err.message);
      if (retries <= 1) {
        console.error('No more retries, exiting');
        throw err;
      }
      console.log(`Retrying in ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
      return connectWithRetry(retries - 1, delayMs * 1.5);
    }
  };

  return connectWithRetry();
};

module.exports = connectDB;
