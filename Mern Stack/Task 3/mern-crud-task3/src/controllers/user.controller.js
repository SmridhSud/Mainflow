const mongoose = require('mongoose');
const User = require('../models/user.model');

/**
 * Create one user (insertOne equivalent)
 */
exports.createUser = async (req, res, next) => {
  try {
    const payload = req.body;
    // Basic validation here (Mongoose also validates)
    if (!payload.name || !payload.email) {
      return res.status(400).json({ message: 'name and email are required' });
    }
    const user = new User(payload);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    // handle dup key error gracefully
    if (err.code === 11000) err.status = 409;
    next(err);
  }
};

/**
 * Create multiple users (insertMany equivalent) with graceful handling
 */
exports.createManyUsers = async (req, res, next) => {
  try {
    const docs = req.body; // expect array
    if (!Array.isArray(docs)) return res.status(400).json({ message: 'expected array of users' });

    // insertMany with ordered:false so that other docs still insert if one fails
    const inserted = await User.insertMany(docs, { ordered: false });
    res.status(201).json({ insertedCount: inserted.length, inserted });
  } catch (err) {
    // In case of partial failures insertMany will throw; but with ordered:false some succeed
    // err.writeErrors contains per-doc errors
    next(err);
  }
};

/**
 * Read operations
 */

// GET /api/users?age_gt=25&role=user&limit=10&page=2&sort=-age,name&fields=name,email
exports.getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      fields,
      q, // generic text search on name/email
      age_gt,
      age_lt,
      role,
      includeDeleted = 'false'
    } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (age_gt) filter.age = { ...(filter.age || {}), $gt: Number(age_gt) };
    if (age_lt) filter.age = { ...(filter.age || {}), $lt: Number(age_lt) };
    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [{ name: re }, { email: re }];
    }

    if (includeDeleted !== 'true') {
      filter.deleted = false;
    }

    const projection = {};
    if (fields) {
      fields.split(',').forEach(f => projection[f.trim()] = 1);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const query = User.find(filter, projection).sort(parseSortString(sort)).skip(skip).limit(Number(limit));

    const [results, total] = await Promise.all([
      query.exec(),
      User.countDocuments(filter)
    ]);

    res.json({ total, page: Number(page), limit: Number(limit), results });
  } catch (err) {
    next(err);
  }
};

function parseSortString(sortStr) {
  // Accept formats like "-age,name" or "age,-name"
  const parts = sortStr.split(',').map(s => s.trim());
  const sortObj = {};
  parts.forEach(p => {
    if (!p) return;
    if (p.startsWith('-')) sortObj[p.substring(1)] = -1;
    else sortObj[p] = 1;
  });
  return sortObj;
}

/**
 * Get single user by id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Update single user (updateOne / findOneAndUpdate)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    // Option: use findByIdAndUpdate returning the new document and run validators
    const updated = await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Update many (updateMany) example: give all users with role 'guest' the role 'user'
 */
exports.bulkUpdate = async (req, res, next) => {
  try {
    const { filter = {}, update = {} } = req.body;
    const result = await User.updateMany(filter, update, { runValidators: true });
    res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};

/**
 * Patch operations: $inc, $push example (assuming arrays exist—here we show $inc)
 */
exports.incrementAge = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { inc = 1 } = req.body;
    const updated = await User.findByIdAndUpdate(id, { $inc: { age: Number(inc) } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Soft delete
 */
exports.softDelete = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const u = await User.findByIdAndUpdate(id, { $set: { deleted: true } }, { new: true });
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'soft deleted', user: u });
  } catch (err) {
    next(err);
  }
};

/**
 * Hard delete (deleteOne)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const result = await User.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'deleted', user: result });
  } catch (err) {
    next(err);
  }
};

/**
 * deleteMany example
 */
exports.deleteMany = async (req, res, next) => {
  try {
    const { filter = {} } = req.body;
    const result = await User.deleteMany(filter);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
};

/**
 * Transaction example: create two users in a transaction (requires replica set or Atlas)
 */
exports.createTwoUsersTransaction = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [a, b] = req.body.users || [];
    if (!a || !b) throw new Error('Require two users in body.users array');

    const opts = { session };
    const createdA = await User.create([a], opts);
    const createdB = await User.create([b], opts);

    await session.commitTransaction();
    session.endSession();
    res.json({ createdA: createdA[0], createdB: createdB[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
