const request = require('supertest');
const app = require('../../app');

describe('indexRouter', () => {
  describe('GET / route', () => {
    it('redirects to view all posts', async () => {
      const res = await request(app).get('/');

      expect([300, 302]).toContain(res.statusCode);
      expect(res.headers.location).toBe('/view/posts');
    });
  });
});
