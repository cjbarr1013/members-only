// Mock the db module before requiring the middleware so the mock is used inside it
jest.mock('../../db/queries', () => ({
  getUserByUsername: jest.fn(),
}));

const db = require('../../db/queries');
const {
  isAuthAction,
  isAuthRoute,
  isAdmin,
  isSameUser,
} = require('../authMiddleware');

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('isAuthAction', () => {
    it('calls next() when authenticated', () => {
      const req = { isAuthenticated: () => true };
      const res = createRes();

      isAuthAction(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('calls next(err) with 401 when not authenticated', () => {
      const req = { isAuthenticated: () => false };
      const res = createRes();

      isAuthAction(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(401);
    });
  });

  describe('isAuthRoute', () => {
    it('calls next() when authenticated', () => {
      const req = { isAuthenticated: () => true };
      const res = createRes();

      isAuthRoute(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('redirects to /auth/login with 401 when not authenticated', () => {
      const req = { isAuthenticated: () => false };
      const res = createRes();

      isAuthRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    });
  });

  describe('isAdmin', () => {
    it('calls next() when user is authenticated admin', () => {
      const req = { isAuthenticated: () => true, user: { admin: true } };
      const res = createRes();

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('calls next(err) with 401 when not admin or not authed', () => {
      const req = { isAuthenticated: () => true, user: { admin: false } };
      const res = createRes();

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(401);
    });
  });

  describe('isSameUser', () => {
    it('calls next() when authenticated and same user id', async () => {
      db.getUserByUsername.mockResolvedValue({ id: 10 });
      const req = {
        isAuthenticated: () => true,
        user: { id: 10 },
        params: { username: 'alice' },
      };
      const res = createRes();

      await isSameUser(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('calls next(err) with 403 when different user', async () => {
      db.getUserByUsername.mockResolvedValue({ id: 11 });
      const req = {
        isAuthenticated: () => true,
        user: { id: 10 },
        params: { username: 'bob' },
      };
      const res = createRes();

      await isSameUser(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(403);
    });

    it('calls next(err) with 401 when not authenticated', async () => {
      db.getUserByUsername.mockResolvedValue({ id: 10 });
      const req = {
        isAuthenticated: () => false,
        user: { id: 10 },
        params: { username: 'alice' },
      };
      const res = createRes();

      await isSameUser(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(401);
    });

    it('calls next(err) with 404 when no user profile found', async () => {
      db.getUserByUsername.mockResolvedValue(null);
      const req = {
        isAuthenticated: () => true,
        user: { id: 10 },
        params: { username: 'ghost' },
      };
      const res = createRes();

      await isSameUser(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(404);
    });

    it('forwards db errors via next(e)', async () => {
      db.getUserByUsername.mockRejectedValue(new Error('DB failure'));
      const req = {
        isAuthenticated: () => true,
        user: { id: 10 },
        params: { username: 'alice' },
      };
      const res = createRes();

      await isSameUser(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch(/DB failure/);
    });
  });
});
