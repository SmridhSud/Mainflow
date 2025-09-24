// models/Notification.js
const mongoose = require('mongoose');
const { NOTIF_TYPES } = require('../utils/constants');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: NOTIF_TYPES, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  read: { type: Boolean, default: false, index: true },
  sent: { type: Boolean, default: false },
  scheduledFor: Date
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Index for retrieval by user and unread
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Mark as read helper
NotificationSchema.methods.markRead = function () {
  this.read = true;
  return this.save();
};

module.exports = mongoose.model('Notification', NotificationSchema);
