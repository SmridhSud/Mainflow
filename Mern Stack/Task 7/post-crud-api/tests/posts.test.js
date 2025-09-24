const request = require('supertest');
const express = require('express');
require('dotenv').config();
const connectDB = require('../config/database');
const routes = require('../routes');
const mongoose = require('mongoose');
const Post = require('../models/Post');

let server;
let app;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  app.use('/api', routes());
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Post.deleteMany({});
});

describe('Posts API', () => {
  test('should create a post', async () => {
    const payload = {
      title: 'Test Post',
      content: 'Hello world',
      author: 'Tester',
      category: 'Technology'
    };
    const res = await request(app).post('/api/posts').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(payload.title);
    expect(res.body.data.slug).toBeDefined();
  });

  test('should list posts with pagination', async () => {
    for (let i = 0; i < 15; i++) {
      await Post.create({
        title: `P${i}`,
        slug: `p${i}`,
        content: `content ${i}`,
        author: 'A',
        category: 'Technology'
      });
    }
    const res = await request(app).get('/api/posts?page=2&limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.data.length).toBe(5);
  });

  test('get single post increments views', async () => {
    const post = await Post.create({
      title: 'View test',
      slug: 'view-test',
      content: 'x',
      author: 'A',
      category: 'Technology'
    });
    const res1 = await request(app).get(`/api/posts/${post._id}`);
    expect(res1.statusCode).toBe(200);
    expect(res1.body.data.views).toBe(1);
    const res2 = await request(app).get(`/api/posts/${post._id}`);
    expect(res2.body.data.views).toBe(2);
  });
});
