const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/', cartController.addToCart); // POST /api/cart
router.get('/:userId', cartController.getCart); // GET /api/cart/:userId
router.put('/:userId/item', cartController.updateItemQuantity); // PUT /api/cart/:userId/item
router.delete('/:userId/item/:productId', cartController.removeItem); // delete single
router.delete('/clear/:userId', cartController.clearCart); // clear cart

module.exports = router;
