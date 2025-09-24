require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Connect DB
connectDB(process.env.MONGO_URI);

// API routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
