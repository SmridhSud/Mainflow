const express = require('express');
const postsRouter = require('./posts');

module.exports = () => {
  const router = express.Router();

  router.use('/posts', postsRouter);

  // Default 404 for API
  router.use((req, res) => {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
  });

  return router;
};
