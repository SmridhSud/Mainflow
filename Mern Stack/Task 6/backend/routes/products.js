const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts); // /api/products
router.get('/search', productController.searchWithFacets); // /api/products/search?q=...
router.get('/category/:category', productController.getByCategory);
router.get('/:id', productController.getProductById);

module.exports = router;
