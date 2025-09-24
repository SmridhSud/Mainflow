require('dotenv').config();
const connectDB = require('./config/database');
const mongoose = require('mongoose');

async function run() {
  await connectDB(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // Example TTL on carts: expire carts that haven't been updated in 30 days (30*24*60*60)
  try {
    await db.collection('carts').createIndex({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
    console.log('TTL index set on carts.updatedAt (30 days)');
  } catch (err) {
    console.warn('Could not create TTL index (it may already exist):', err.message);
  }

  // Ensure text index for products (already defined on model, but ensure)
  try {
    await db.collection('products').createIndex({ name: 'text', description: 'text', category: 'text', subcategory: 'text' });
    console.log('Text index ensured on products');
  } catch (err) {
    console.warn('Text index creation issue:', err.message);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
