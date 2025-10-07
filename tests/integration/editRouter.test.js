const request = require('supertest');
const app = require('../../app');
const db = require('../../db/queries');
const { registerAndLogin } = require('../helpers/auth');

describe('editRouter', () => {
  describe('POST /profile/:username route', () => {
    it('edits user and redirects to /view/profile/:username when authorized and same user', async () => {
      const { agent, username } = await registerAndLogin(app);

      const res = await agent
        .post(`/edit/profile/${username}`)
        .type('form')
        .send({
          first: 'Jace',
          last: 'Smith',
          adminChecked: undefined,
          adminValue: '',
          hasPic: false,
          bio: 'Hello world',
          loc: 'NY',
          birthday: '2000-01-01',
        });

      expect([302, 303]).toContain(res.statusCode);
      expect(res.headers.location).toBe(`/view/profile/${username}`);

      // Verify persisted values
      const saved = await db.getUserInfoByUsername(username);
      expect(saved).toMatchObject({
        has_pic: false,
        bio: 'Hello world',
        loc: 'NY',
      });
    });

    it('returns 401 when user is not authorized', async () => {
      const { username } = await registerAndLogin(app); // ensure target user exists

      const res = await request(app)
        .post(`/edit/profile/${username}`)
        .type('form')
        .send({ bio: 'No auth' });

      expect(res.statusCode).toBe(401);
    });

    it('returns 404 when user is not found', async () => {
      const { agent } = await registerAndLogin(app);
      const missing = `missing_${Date.now()}`;

      const res = await agent
        .post(`/edit/profile/${missing}`)
        .type('form')
        .send({ bio: 'does not matter' });

      expect(res.statusCode).toBe(404);
    });

    it('returns 403 when user attempting to access is not same', async () => {
      const a = await registerAndLogin(app);
      const b = await registerAndLogin(app);

      const res = await a.agent
        .post(`/edit/profile/${b.username}`)
        .type('form')
        .send({ bio: 'hacker' });

      expect(res.statusCode).toBe(403);
    });

    it('returns 400 when input is not valid', async () => {
      const { agent, username } = await registerAndLogin(app);
      const tooLongBio = 'a'.repeat(300); // assuming max 250

      const res = await agent
        .post(`/edit/profile/${username}`)
        .type('form')
        .send({ bio: tooLongBio, loc: 'X'.repeat(100) }); // assuming loc max 50

      expect(res.statusCode).toBe(400);
    });
  });
});
