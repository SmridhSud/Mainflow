require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/user.routes');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ ok: true, msg: 'MERN CRUD Task 3 API' }));

app.use('/api/users', userRoutes);

// error handler
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to start server', err);
    process.exit(1);
  });
