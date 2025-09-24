// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const ProfileSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  avatar: { type: String },
  bio: { type: String, maxlength: 500 },
  institution: { type: String },
  grade: { type: String }
}, { _id: false });

const NotificationPrefSchema = new mongoose.Schema({
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
  deadlineReminder: { type: Number, default: 24 }, // hours before
  dailyDigest: { type: Boolean, default: false }
}, { _id: false });

const PreferencesSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  notifications: { type: NotificationPrefSchema, default: () => ({}) },
  timezone: { type: String, default: 'UTC' }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: { type: ProfileSchema, default: () => ({}) },
  preferences: { type: PreferencesSchema, default: () => ({}) },
  emailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
}, {
  timestamps: true // createdAt, updatedAt
});

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  const fn = this.profile?.firstName ?? '';
  const ln = this.profile?.lastName ?? '';
  return `${fn} ${ln}`.trim();
});

// Pre-save: hash if password modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Instance method: compare password
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Index for searching by username or email quickly (compound)
UserSchema.index({ username: 1, email: 1 });

module.exports = mongoose.model('User', UserSchema);
