const mongoose = require('mongoose');

/**
 * calculateCartTotal: recomputes total from items (price * qty)
 * Also applies simple tax and discount (example)
 */
function calculateCartTotal(items, options = {}) {
  const taxRate = options.taxRate ?? 0.08; // 8%
  const discount = options.discount ?? 0; // flat or percent? here flat
  let subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  let tax = +(subtotal * taxRate);
  let total = subtotal + tax - discount;
  return { subtotal, tax, discount, total: Math.max(total, 0) };
}

/**
 * validateStock: ensure enough stock exists for each cart item
 * productsMap: Map(productId -> productDoc)
 */
function validateStock(items, productsMap) {
  const conflicts = [];
  for (const item of items) {
    const p = productsMap.get(item.productId?.toString());
    if (!p) {
      conflicts.push({ productId: item.productId, reason: 'Product not found' });
      continue;
    }
    if (p.stock < item.quantity) {
      conflicts.push({ productId: item.productId, available: p.stock, requested: item.quantity });
    }
  }
  return conflicts;
}

/**
 * startSessionWrapper: helper for mongoose transactions
 */
async function startSessionWrapper(mongooseInstance) {
  const session = await mongooseInstance.startSession();
  session.startTransaction();
  return session;
}

module.exports = {
  calculateCartTotal,
  validateStock,
  startSessionWrapper
};
