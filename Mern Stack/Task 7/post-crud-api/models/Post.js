const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: { unique: true } // slug uniqueness
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10000 characters'],
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Business', 'Lifestyle', 'Education', 'Other'],
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  publishedDate: {
    type: Date,
    default: null,
    index: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true // createdAt, updatedAt
});

// Text index for search
PostSchema.index({ title: 'text', content: 'text' });

// Compound index for common queries
PostSchema.index({ author: 1, category: 1, status: 1 });

// Pre hooks could go here if needed (none for now)

module.exports = mongoose.model('Post', PostSchema);
