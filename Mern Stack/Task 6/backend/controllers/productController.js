const Product = require('../models/Product');
const { validationResult } = require('express-validator');

/**
 * GET /api/products
 * supports pagination, sort, filter (category), min/max price
 */
exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(100, parseInt(req.query.limit || '12'));
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.minPrice) filter.price = { ...filter.price, $gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) filter.price = { ...filter.price, $lte: parseFloat(req.query.maxPrice) };

    // search
    if (req.query.q) {
      filter.$text = { $search: req.query.q };
    }

    // sort
    let sort = { createdAt: -1 };
    if (req.query.sortBy === 'priceAsc') sort = { price: 1 };
    if (req.query.sortBy === 'priceDesc') sort = { price: -1 };
    if (req.query.sortBy === 'rating') sort = { 'rating.average': -1 };

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean()
    ]);

    res.json({ page, limit, total, products });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id).lean();
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    res.json(prod);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/category/:category
 */
exports.getByCategory = async (req, res, next) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category, isActive: true }).limit(50).lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/search?q=
 * demonstrates more complex aggregation for search + facets
 */
exports.searchWithFacets = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '12'));
    const skip = (page - 1) * limit;

    // aggregation pipeline: text search, facet to get categories counts + results
    const pipeline = [
      { $match: { $text: { $search: q }, isActive: true } },
      {
        $facet: {
          results: [
            { $sort: { score: { $meta: "textScore" }, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                name: 1, price: 1, originalPrice: 1, category: 1, images: 1, stock: 1, rating: 1
              }
            }
          ],
          categories: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const aggRes = await Product.aggregate(pipeline);
    const { results = [], categories = [], totalCount = [] } = aggRes[0] || {};
    const total = totalCount[0]?.count || 0;

    res.json({ page, limit, total, results, categories });
  } catch (err) {
    next(err);
  }
};
