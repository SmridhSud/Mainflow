const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, index: true, required: true, unique: true },
  name: { type: String },
  passwordHash: { type: String }, // if you add auth later
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
