const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // snapshot price
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [cartItemSchema],
  totalAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// TTL index example for guest carts (optional): delete carts not updated in 30 days
// If you want TTL, create index with expireAfterSeconds in createIndexes.js
cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
