require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const createServer = require('./routes');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { PORT = 3000 } = process.env;

const app = express();

// Basic middleware stack
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health check route before app routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// Mount API routes
app.use('/api', createServer());

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  await connectDB();
});

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Closing server and DB connection...`);
  server.close(() => {
    console.log('HTTP server closed.');
  });
  // close mongoose connection
  const mongoose = require('mongoose');
  try {
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB close', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
