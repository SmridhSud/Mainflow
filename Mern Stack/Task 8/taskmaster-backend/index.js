// index.js (for quick DB test)
require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await connectDB(MONGO_URI);

    const oneUser = await User.findOne().lean();
    console.log('Sample user:', oneUser?.email);

    const { items, total } = await Task.getFiltered({ userId: oneUser?._id, page: 1, limit: 5 });
    console.log(`Found ${total} tasks for that user, showing ${items.length}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
