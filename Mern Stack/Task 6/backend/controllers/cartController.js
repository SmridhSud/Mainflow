const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { calculateCartTotal, validateStock } = require('../utils/helpers');

/**
 * POST /api/cart
 * Add item(s) to cart (create or update)
 * Body: { userId, items: [{ productId, quantity }] }
 *
 * This function:
 *  - loads involved product docs
 *  - validates stock
 *  - applies snapshot price
 *  - uses transaction to update/create cart and optionally reserve stock
 */
exports.addToCart = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { userId, items } = req.body;
    if (!userId || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'userId and items required' });
    }

    // load product docs for involved productIds
    const productIds = items.map(i => mongoose.Types.ObjectId(i.productId));
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productsMap = new Map(products.map(p => [p._id.toString(), p]));

    // validate stock
    const conflicts = validateStock(items, productsMap);
    if (conflicts.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'Stock conflict', conflicts });
    }

    // upsert cart
    let cart = await Cart.findOne({ userId }).session(session);
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // merge items: if product exists in cart, increment quantity, else push new with price snapshot
    for (const it of items) {
      const pid = it.productId;
      const requestedQty = parseInt(it.quantity, 10);
      const prod = productsMap.get(pid.toString());
      if (!prod) continue;
      const existing = cart.items.find(i => i.productId.toString() === pid.toString());
      if (existing) {
        existing.quantity = Math.min(prod.stock, existing.quantity + requestedQty);
        existing.price = prod.price; // snap latest price
        existing.addedAt = new Date();
      } else {
        cart.items.push({
          productId: prod._id,
          quantity: Math.min(prod.stock, requestedQty),
          price: prod.price
        });
      }
    }

    // recompute totals
    const totals = calculateCartTotal(cart.items, { taxRate: 0.08, discount: 0 });
    cart.totalAmount = totals.total;
    await cart.save({ session });

    // Optionally: reserve stock here by decrementing product.stock (if you implement reservation)
    // For this example we DO NOT decrement permanent stock until checkout completes.
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Cart updated', cart });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

/**
 * GET /api/cart/:userId
 */
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId').lean();
    if (!cart) return res.json({ items: [], totalAmount: 0 });
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cart/:userId/item
 * body: { productId, quantity } -> update quantity (set)
 */
exports.updateItemQuantity = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Cart not found' });
    }

    const prod = await Product.findById(productId).session(session);
    if (!prod) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Product not found' });
    }

    const q = Math.max(1, parseInt(quantity, 10));
    if (q > prod.stock) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'Not enough stock', available: prod.stock });
    }

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Item not in cart' });
    }

    item.quantity = q;
    item.price = prod.price; // refresh price snapshot
    cart.totalAmount = calculateCartTotal(cart.items).total;
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Quantity updated', cart });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

/**
 * DELETE /api/cart/:userId/item/:productId
 */
exports.removeItem = async (req, res, next) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    cart.totalAmount = calculateCartTotal(cart.items).total;
    await cart.save();

    res.json({ message: 'Item removed', cart });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart/clear/:userId
 */
exports.clearCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ message: 'Cart already empty' });
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } catch (err) { next(err); }
};
