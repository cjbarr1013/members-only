require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const db = require('../../db/queries');
const { registerAndLogin } = require('../helpers/auth');

describe('addRouter', () => {
  describe('POST /add/post route', () => {
    it('creates a post when authenticated and input is valid', async () => {
      const { agent } = await registerAndLogin(app);

      const res = await agent
        .post('/add/post')
        .type('form')
        .send({ title: 'My Title', message: 'My Message' });
      // checks for successful POST and redirect
      expect([302, 303]).toContain(res.statusCode);

      const posts = await db.getAllPosts();
      const success =
        posts[0].title === 'My Title' && posts[0].message === 'My Message';
      expect(success).toBeTruthy();
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/add/post')
        .type('form')
        .send({ title: 'My Title', message: 'My Message' });

      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when input not valid', async () => {
      const { agent } = await registerAndLogin(app);

      const res = await agent
        .post('/add/post')
        .type('form')
        .send({ title: '', message: '' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /add/comment/:postId route', () => {
    it('creates a comment when authenticated', async () => {
      const { agent } = await registerAndLogin(app);

      const beforePost = await db.getPostById(1);

      const res = await agent
        .post(`/add/comment/1`)
        .type('form')
        .send({ message: 'Nice post!' });
      // checks for successful POST and redirect
      expect([302, 303]).toContain(res.statusCode);

      const afterPost = await db.getPostById(1);

      expect(
        parseInt(beforePost.comment_count) < parseInt(afterPost.comment_count)
      ).toBeTruthy();
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post(`/add/comment/1`)
        .type('form')
        .send({ message: 'Hi' });

      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when input not valid', async () => {
      const { agent } = await registerAndLogin(app);

      const res = await agent
        .post(`/add/comment/1`)
        .type('form')
        .send({ message: '' });

      expect(res.statusCode).toBe(400);
    });
  });
});
