require('dotenv').config();
const connectDB = require('./config/database');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const mongoose = require('mongoose');
const sampleData = require('./utils/seedData.json');

async function seed() {
  await connectDB(process.env.MONGO_URI);

  // wipe sample collections (BE CAREFUL in production)
  await Product.deleteMany({});
  await Cart.deleteMany({});

  // insert products
  const inserted = await Product.insertMany(sampleData.products);
  console.log(`Inserted ${inserted.length} products`);

  // create a sample cart for user 'guest123'
  const cart = new Cart({
    userId: 'guest123',
    items: [{
      productId: inserted[0]._id,
      quantity: 2,
      price: inserted[0].price
    }],
    totalAmount: inserted[0].price * 2
  });
  await cart.save();
  console.log('Sample cart created for guest123');

  mongoose.connection.close();
  console.log('Seeding complete.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
