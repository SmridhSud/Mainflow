const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
