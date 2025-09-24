const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      // Mongoose 6+ doesn't need these options, but keep safeguards
      // keepAlive: true,
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
