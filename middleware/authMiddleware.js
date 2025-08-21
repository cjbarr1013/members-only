const db = require('../db/queries');

function isAuthAction(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    const err = new Error('You must be signed in to complete this action.');
    err.statusCode = 401;
    next(err);
  }
}

function isAuthRoute(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).redirect('/auth/login');
  }
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.admin) {
    next();
  } else {
    const err = new Error('You need admin privileges to complete this action.');
    err.statusCode = 401;
    next(err);
  }
}

async function isSameUser(req, res, next) {
  try {
    const userProfile = await db.getUserByUsername(req.params.username);
    if (req.isAuthenticated() && req.user.id === userProfile.id) {
      next();
    } else {
      const err = new Error(
        'You are attempting to access a protected page for another user. DENIED.'
      );
      err.statusCode = 401;
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

module.exports = {
  isAuthAction,
  isAuthRoute,
  isAdmin,
  isSameUser,
};
