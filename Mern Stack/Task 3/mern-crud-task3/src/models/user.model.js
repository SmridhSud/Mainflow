const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  age: {
    type: Number,
    min: 0,
    max: 120,
    required: false
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'manager', 'guest'],
    default: 'user'
  },
  deleted: {
    type: Boolean,
    default: false // used for soft delete
  }
}, {
  timestamps: true // createdAt, updatedAt
});

// Indexes for performance: email unique, compound index on role+age
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, age: -1 });

/**
 * Static method for soft delete
 */
userSchema.statics.softDelete = function (filter) {
  return this.updateMany(filter, { $set: { deleted: true } });
};

module.exports = mongoose.model('User', userSchema);
