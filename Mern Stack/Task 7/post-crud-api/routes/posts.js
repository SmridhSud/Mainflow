const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { createPostValidator, updatePostValidator, objectIdValidator } = require('../middleware/validation');

// Create post
router.post('/', createPostValidator, postController.createPost);

// Get all posts (pagination/filter/search/sort)
router.get('/', postController.getPosts);

// Bulk create
router.post('/bulk', postController.bulkCreate);

// Analytics
router.get('/analytics', postController.analytics);

// Get single post
router.get('/:id', objectIdValidator, postController.getPostById);

// Update post (PUT for full/partial update supported)
router.put('/:id', objectIdValidator, updatePostValidator, postController.updatePost);

// Soft delete or hard delete via query ?hard=true
router.delete('/:id', objectIdValidator, postController.deletePost);

module.exports = router;
