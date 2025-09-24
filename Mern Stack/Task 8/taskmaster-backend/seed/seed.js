// seed/seed.js
require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const faker = require('faker');

const MONGO_URI = process.env.MONGO_URI;

const NUM_USERS = 3;
const TASKS_PER_USER = 10;

(async function seed() {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  try {
    await connectDB(MONGO_URI);

    // Clean
    await Promise.all([User.deleteMany({}), Task.deleteMany({}), Notification.deleteMany({})]);
    console.log('Cleared existing data');

    const users = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const user = new User({
        username: faker.internet.userName().toLowerCase(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123', // will be hashed by pre-save
        profile: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          bio: faker.lorem.sentence()
        },
        preferences: {
          theme: i % 2 === 0 ? 'dark' : 'light',
          timezone: 'UTC'
        }
      });
      await user.save();
      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    const tasks = [];
    for (const u of users) {
      for (let j = 0; j < TASKS_PER_USER; j++) {
        const due = faker.date.soon(30); // within 30 days
        const priority = ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)];
        const status = ['Todo', 'In Progress', 'Review', 'Completed'][Math.floor(Math.random() * 4)];

        const subtaskCount = Math.floor(Math.random() * 4);
        const subtasks = [];
        for (let s = 0; s < subtaskCount; s++) {
          subtasks.push({ title: faker.hacker.verb() + ' ' + faker.hacker.noun(), completed: Math.random() > 0.5 });
        }

        const task = new Task({
          title: faker.lorem.sentence(4),
          description: faker.lorem.sentences(2),
          userId: u._id,
          category: ['Assignment', 'Project', 'Exam', 'Reading'][Math.floor(Math.random() * 4)],
          priority,
          status,
          dueDate: due,
          estimatedTime: Math.floor(Math.random() * 180),
          actualTime: 0,
          tags: faker.lorem.words(3).split(' '),
          subtasks
        });

        await task.save();
        tasks.push(task);
      }
    }
    console.log(`Created ${tasks.length} tasks`);

    // Notifications sample
    const notifs = [];
    for (let i = 0; i < users.length; i++) {
      const n = new Notification({
        userId: users[i]._id,
        type: 'deadline_reminder',
        title: `Reminder: upcoming due tasks`,
        message: `You have tasks due soon. Check your calendar.`,
        sent: false
      });
      await n.save();
      notifs.push(n);
    }
    console.log(`Created ${notifs.length} notifications`);

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
})();
