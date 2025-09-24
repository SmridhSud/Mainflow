const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { VALID_CATEGORIES, VALID_STATUS } = require('../config/constants');

const createPostValidator = [
  body('title').isString().trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('content').isString().trim().notEmpty().withMessage('Content is required').isLength({ max: 10000 }),
  body('author').isString().trim().notEmpty().withMessage('Author is required').isLength({ max: 100 }),
  body('category').isString().trim().notEmpty().withMessage('Category is required').isIn(VALID_CATEGORIES),
  body('status').optional().isIn(VALID_STATUS),
  body('tags').optional().isArray(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array().map(e => e.msg) });
    next();
  }
];

const updatePostValidator = [
  body('title').optional().isString().trim().notEmpty().isLength({ max: 200 }),
  body('content').optional().isString().trim().notEmpty().isLength({ max: 10000 }),
  body('author').optional().isString().trim().notEmpty().isLength({ max: 100 }),
  body('category').optional().isString().trim().isIn(VALID_CATEGORIES),
  body('status').optional().isIn(VALID_STATUS),
  body('tags').optional().isArray(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array().map(e => e.msg) });
    next();
  }
];

const objectIdValidator = [
  param('id').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid id format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array().map(e => e.msg) });
    next();
  }
];

module.exports = {
  createPostValidator,
  updatePostValidator,
  objectIdValidator
};
