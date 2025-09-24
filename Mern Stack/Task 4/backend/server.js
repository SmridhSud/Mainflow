require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200
}));

// Connect DB
connectDB(process.env.MONGO_URI);

// Routes
app.use('/api/auth', authRoutes);

// Basic test route
app.get('/api/ping', (req, res) => res.json({ msg: 'pong' }));

// Error handler (basic)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
