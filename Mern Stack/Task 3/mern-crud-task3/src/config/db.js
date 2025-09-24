const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not defined in environment');

  // mongoose options for pooling/timeouts
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    // poolSize not used in modern Mongoose; you can pass minPoolSize / maxPoolSize via connection string if needed
  };

  await mongoose.connect(uri, options);
  logger.info('Connected to MongoDB');
  // Show current connection info
  logger.info(`Mongoose connection readyState: ${mongoose.connection.readyState}`);
};

module.exports = connectDB;
