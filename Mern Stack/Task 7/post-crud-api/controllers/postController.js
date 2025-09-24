const Post = require('../models/Post');
const slugify = require('slugify');
const mongoose = require('mongoose');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, VALID_STATUS } = require('../config/constants');

// Helper to make unique slug (append counter if collision)
async function generateUniqueSlug(title) {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 200) || 'post';
  let slug = base;
  let counter = 0;
  while (await Post.exists({ slug })) {
    counter += 1;
    slug = `${base}-${counter}`;
    if (counter > 1000) throw new Error('Failed to generate unique slug');
  }
  return slug;
}

// Create post
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, author, tags = [], category, status } = req.body;

    // Duplicate title prevention
    const existing = await Post.findOne({ title: title.trim() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'A post with the same title already exists' });
    }

    const slug = await generateUniqueSlug(title);

    const publishedDate = status === 'published' ? new Date() : null;

    const post = new Post({
      title: title.trim(),
      slug,
      content: content.trim(),
      author: author.trim(),
      tags: tags.map(t => t.toLowerCase()),
      category,
      status: status || 'draft',
      publishedDate
    });

    await post.save();

    return res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// Bulk create (array of posts)
exports.bulkCreate = async (req, res, next) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Provide an array of posts' });
    }

    // generate slugs for each synchronously to avoid duplicates
    const docs = [];
    for (const item of items) {
      if (!item.title || !item.content || !item.author || !item.category) {
        return res.status(400).json({ success: false, error: 'Each post must include title, content, author and category' });
      }
      const slug = await generateUniqueSlug(item.title);
      docs.push({
        title: item.title.trim(),
        slug,
        content: item.content.trim(),
        author: item.author.trim(),
        tags: (item.tags || []).map(t => t.toLowerCase()),
        category: item.category,
        status: item.status || 'draft',
        publishedDate: (item.status === 'published') ? new Date() : null
      });
    }

    const created = await Post.insertMany(docs, { ordered: false });
    return res.status(201).json({ success: true, count: created.length, data: created });
  } catch (err) {
    next(err);
  }
};

// Get posts with pagination, filtering, sorting, search
exports.getPosts = async (req, res, next) => {
  try {
    let { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, category, status, author, sort, search, tags } = req.query;
    page = parseInt(page, 10) || DEFAULT_PAGE;
    limit = Math.min(parseInt(limit, 10) || DEFAULT_LIMIT, MAX_LIMIT);

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (author) filter.author = author;
    if (tags) {
      const tagArr = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase());
      filter.tags = { $in: tagArr };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const query = Post.find(filter);

    // Sorting: default -createdAt
    if (sort) {
      query.sort(sort);
    } else {
      query.sort('-createdAt');
    }

    const total = await Post.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    query.skip((page - 1) * limit).limit(limit);

    const results = await query.exec();

    return res.json({
      success: true,
      meta: { total, page, pages, limit },
      data: results
    });
  } catch (err) {
    next(err);
  }
};

// Get single post by id (increment views)
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    // Increment views atomically
    await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });

    // Re-fetch with updated views
    const updated = await Post.findById(id);
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Update post
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // If title is being changed, ensure no duplicate title and update slug
    if (updates.title) {
      const existing = await Post.findOne({ title: updates.title.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Another post with this title already exists' });
      }
      updates.slug = await generateUniqueSlug(updates.title);
      updates.title = updates.title.trim();
    }

    if (updates.content) updates.content = updates.content.trim();
    if (updates.author) updates.author = updates.author.trim();
    if (updates.tags) updates.tags = updates.tags.map(t => t.toLowerCase());

    // Handle status change: if changed to published and no publishedDate -> set publishedDate
    if (updates.status && updates.status === 'published') {
      updates.publishedDate = updates.publishedDate || new Date();
    } else if (updates.status && updates.status !== 'published') {
      updates.publishedDate = null;
    }

    updates.updatedAt = new Date();

    const updated = await Post.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Post not found' });

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Delete post (soft delete default; hard delete if ?hard=true)
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hard = req.query.hard === 'true';

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    if (hard) {
      await Post.deleteOne({ _id: id });
      return res.json({ success: true, message: 'Post permanently deleted' });
    }

    // Soft delete => mark archived
    post.status = 'archived';
    post.updatedAt = new Date();
    await post.save();
    return res.json({ success: true, message: 'Post archived (soft deleted)', data: post });
  } catch (err) {
    next(err);
  }
};

// Analytics: basic stats
exports.analytics = async (req, res, next) => {
  try {
    const total = await Post.countDocuments();
    const published = await Post.countDocuments({ status: 'published' });
    const drafts = await Post.countDocuments({ status: 'draft' });
    const archived = await Post.countDocuments({ status: 'archived' });

    // top 5 posts by views
    const topByViews = await Post.find().sort('-views').limit(5).select('title views slug');

    // group by category
    const byCategory = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    return res.json({
      success: true,
      data: { total, published, drafts, archived, topByViews, byCategory }
    });
  } catch (err) {
    next(err);
  }
};
