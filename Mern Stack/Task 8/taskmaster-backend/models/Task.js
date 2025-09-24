// models/Task.js
const mongoose = require('mongoose');
const { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } = require('../utils/constants');

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: { type: String, enum: TASK_CATEGORIES, default: 'Assignment' },
  priority: { type: String, enum: TASK_PRIORITIES, default: 'Medium', index: true },
  status: { type: String, enum: TASK_STATUSES, default: 'Todo', index: true },
  dueDate: { type: Date, required: true, index: true },
  estimatedTime: { type: Number, min: 0 },
  actualTime: { type: Number, min: 0, default: 0 },
  tags: [{ type: String, trim: true, lowercase: true }],
  attachments: [AttachmentSchema],
  subtasks: [SubtaskSchema],
  completedAt: Date
}, {
  timestamps: true // createdAt, updatedAt
});

// Text index for search on title + description + tags
TaskSchema.index({ title: 'text', description: 'text', tags: 'text' }, { name: 'TaskTextIndex', default_language: 'english' });

// Compound index to speed queries: user + status + priority + dueDate
TaskSchema.index({ userId: 1, status: 1, priority: 1, dueDate: 1 });

// Virtual: percent completion (based on subtasks)
TaskSchema.virtual('progress').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === 'Completed' ? 100 : 0;
  }
  const completed = this.subtasks.filter(s => s.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Pre-save: set completedAt if status changed to Completed
TaskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'Completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status !== 'Completed') {
    this.completedAt = undefined;
  }
  next();
});

// Static: paginated get with filters
/**
 * filters: { userId, priority, status, category, search, fromDate, toDate, tags, page, limit, sort }
 */
TaskSchema.statics.getFiltered = async function (filters = {}) {
  const {
    userId,
    priority,
    status,
    category,
    search,
    fromDate,
    toDate,
    tags,
    page = 1,
    limit = 20,
    sort = { dueDate: 1 }
  } = filters;

  const query = {};
  if (userId) query.userId = userId;
  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (category) query.category = category;
  if (fromDate || toDate) query.dueDate = {};
  if (fromDate) query.dueDate.$gte = new Date(fromDate);
  if (toDate) query.dueDate.$lte = new Date(toDate);
  if (tags && tags.length) query.tags = { $all: tags.map(t => t.toLowerCase()) };

  // full-text search or fuzzy
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [items, total] = await Promise.all([
    this.find(query).sort(sort).skip(skip).limit(limit).lean(),
    this.countDocuments(query)
  ]);

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

// Static: analytics sample - completion counts by status
TaskSchema.statics.analyticsByStatus = function (userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
};

module.exports = mongoose.model('Task', TaskSchema);
