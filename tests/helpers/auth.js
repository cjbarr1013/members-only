const request = require('supertest');

// Register user and keep session with Supertest agent
async function registerAndLogin(app, admin = false) {
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
      admin,
    });

  return { agent, res, username };
}

module.exports = {
  registerAndLogin,
};
