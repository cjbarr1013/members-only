const request = require('supertest');
const app = require('../../app');
const db = require('../../db/queries');
const { registerAndLogin } = require('../helpers/auth');

describe('viewRouter', () => {
  describe('GET /posts route', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/view/posts');

      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /posts/:id route', () => {
    it('returns 200 if signed in', async () => {
      const { agent } = await registerAndLogin(app);
      const posts = await db.getAllPosts();
      expect(posts[0]).toBeTruthy();

      const res = await agent.get(`/view/posts/${posts[0].id}`);

      expect(res.statusCode).toBe(200);
    });

    it('redirects to sign in if not signed in', async () => {
      const posts = await db.getAllPosts();
      expect(posts[0]).toBeTruthy();

      const res = await request(app).get(`/view/posts/${posts[0].id}`);

      expect([300, 302]).toContain(res.statusCode);
      expect(res.headers.location).toBe('/auth/login');
    });
  });

  describe('GET /profile/:username route', () => {
    it('returns 200 if signed in', async () => {
      const { agent, username } = await registerAndLogin(app);

      const res = await agent.get(`/view/profile/${username}`);

      expect(res.statusCode).toBe(200);
    });

    it('redirects to sign in if not signed in', async () => {
      const { agent, username } = await registerAndLogin(app);
      const res = await agent.post('/auth/logout');
      expect([302, 303]).toContain(res.statusCode);
      expect(res.headers.location).toBe('/');

      const newRes = await agent.get(`/view/profile/${username}`);

      expect([300, 302]).toContain(newRes.statusCode);
      expect(newRes.headers.location).toBe('/auth/login');
    });
  });
});
