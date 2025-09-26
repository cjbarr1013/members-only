const request = require('supertest');
const app = require('../../app');
const db = require('../../db/queries');
const { registerAndLogin } = require('../helpers/auth');

describe('authRouter', () => {
  describe('GET /register route', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/auth/register');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /register route', () => {
    it('creates user when input is valid', async () => {
      const username = `u${Math.floor(Math.random() * 10000000000)}`;
      const agent = request.agent(app);
      const res = await agent
        .post('/auth/register') // user is signed in on sign up
        .type('form')
        .send({
          first: 'Test',
          last: 'User',
          username,
          password: 'Password123!',
          passwordVerify: 'Password123!',
          adminChecked: undefined,
          adminValue: '',
        });

      expect([302, 303]).toContain(res.statusCode);
      const user = await db.getUserByUsername(username);
      expect(user).toBeTruthy();
    });

    it('creates user with admin privleges when secret code is correct', async () => {
      const username = `u${Math.floor(Math.random() * 10000000000)}`;
      const agent = request.agent(app);
      const res = await agent
        .post('/auth/register') // user is signed in on sign up
        .type('form')
        .send({
          first: 'Test',
          last: 'User',
          username,
          password: 'Password123!',
          passwordVerify: 'Password123!',
          adminChecked: true,
          adminValue: process.env.ADMIN_SECRET,
        });

      expect([302, 303]).toContain(res.statusCode);
      const user = await db.getUserByUsername(username);
      expect(user).toBeTruthy();
      expect(user.admin).toBeTruthy();
    });

    it('returns 400 when admin secret code is not correct', async () => {
      const username = `u${Math.floor(Math.random() * 10000000000)}`;
      const agent = request.agent(app);
      const res = await agent
        .post('/auth/register') // user is signed in on sign up
        .type('form')
        .send({
          first: 'Test',
          last: 'User',
          username,
          password: 'Password123!',
          passwordVerify: 'Password123!',
          adminChecked: true,
          adminValue: 'wrongValue',
        });

      expect(res.statusCode).toBe(400);
      const user = await db.getUserByUsername(username);
      expect(user).toBeFalsy();
    });

    it('user is logged in after successful post request', async () => {
      const username = `u${Math.floor(Math.random() * 10000000000)}`;
      const agent = request.agent(app);
      const res = await agent.post('/auth/register').type('form').send({
        first: 'Test',
        last: 'User',
        username,
        password: 'Password123!',
        passwordVerify: 'Password123!',
        adminChecked: undefined,
        adminValue: '',
      });
      expect([302, 303]).toContain(res.statusCode);

      // Test that the next route is accessible to the user, confirms log in
      const profileRes = await agent.get('/auth/register/profile');
      expect(profileRes.statusCode).toBe(200);
    });

    it('returns 400 when input not valid, does not create user', async () => {
      const badUsername = 'usr1'; // too short (needs 6-16 alphanumeric)
      const agent = request.agent(app);
      const res = await agent.post('/auth/register').type('form').send({
        first: '', // invalid
        last: '', // invalid
        username: badUsername,
        password: 'short', // invalid
        passwordVerify: 'different', // mismatch
        adminChecked: false,
        adminValue: '',
      });

      expect(res.statusCode).toBe(400);
      const user = await db.getUserByUsername(badUsername);
      expect(user).toBeFalsy();
    });
  });

  describe('GET /register/profile route', () => {
    it('returns 200 when authenticated', async () => {
      const { agent } = await registerAndLogin(app);
      const res = await agent.get('/auth/register/profile');
      expect(res.statusCode).toBe(200);
    });

    it('redirects to /auth/login when not authenticated', async () => {
      const res = await request(app).get('/auth/register/profile');
      expect([302, 303]).toContain(res.statusCode);
      expect(res.headers.location).toBe('/auth/login');
    });
  });

  describe('POST /register/profile route', () => {
    it('updates user when input is valid', async () => {
      const { agent, username } = await registerAndLogin(app);

      const res = await agent.post('/auth/register/profile').type('form').send({
        picUrl: 'https://example.com/p.png',
        bio: 'Hello world',
        loc: 'NY',
        birthday: '2000-01-01',
      });
      expect([302, 303]).toContain(res.statusCode);

      // Verify persisted values
      const saved = await db.getUserInfoByUsername(username);
      expect(saved).toMatchObject({
        pic_url: 'https://example.com/p.png',
        bio: 'Hello world',
        loc: 'NY',
      });
    });

    it('returns 400 when input is not valid', async () => {
      const { agent } = await registerAndLogin(app);
      const res = await agent.post('/auth/register/profile').type('form').send({
        picUrl: 'not-a-url', // invalid URL
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/auth/register/profile')
        .type('form')
        .send({
          picUrl: 'https://example.com/p.png',
          bio: 'Hi',
          loc: 'NY',
        });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /login route', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/auth/login');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /login route', () => {
    it('successfully logs in with valid credentials', async () => {
      // Use seeded user with known password 'password'
      const agent = request.agent(app);
      const res = await agent
        .post('/auth/login')
        .type('form')
        .send({ username: 'jace_mitch', password: 'password' });
      expect([302, 303]).toContain(res.statusCode);
      expect(res.headers.location).toBe('/view/posts');
    });

    it('redirects back to /auth/login with invalid credentials', async () => {
      const agent = request.agent(app);
      const res = await agent
        .post('/auth/login')
        .type('form')
        .send({ username: 'nonexistentuser', password: 'wrong' });
      expect([302, 303]).toContain(res.statusCode);
      expect(res.headers.location).toBe('/auth/login');
    });
  });

  describe('GET /logout route', () => {
    it('sucessfully logs out when authenticated', async () => {
      const { agent } = await registerAndLogin(app);
      const res = await agent.post('/auth/logout');
      expect([302, 303]).toContain(res.statusCode);
      expect(res.headers.location).toBe('/view/posts');

      // Verify session is cleared by attempting to access an authed route
      const after = await agent.get('/auth/register/profile');
      expect([302, 303]).toContain(after.statusCode);
      expect(after.headers.location).toBe('/auth/login');
    });

    it('redirects to /auth/login when not authenticated', async () => {
      const res = await request(app).post('/auth/logout');
      expect([302, 303]).toContain(res.statusCode);
      expect(res.headers.location).toBe('/auth/login');
    });
  });
});
