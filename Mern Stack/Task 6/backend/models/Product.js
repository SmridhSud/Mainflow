const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  average: { type: Number, default: 0 },
  count: { type: Number, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: null },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, index: true },
  images: [{ type: String }],
  stock: { type: Number, required: true, min: 0, index: true },
  rating: { type: ratingSchema, default: () => ({}) },
  features: [{ type: String }],
  specifications: { type: Map, of: String },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// text index for search across name + description
productSchema.index({ name: 'text', description: 'text', category: 'text', subcategory: 'text' });

// update updatedAt on save
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
