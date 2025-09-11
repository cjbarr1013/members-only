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
    if (!req.isAuthenticated()) {
      const err = new Error('You must be signed in to complete this action.');
      err.statusCode = 401;
      return next(err);
    }

    const userProfile = await db.getUserByUsername(req.params.username);
    if (!userProfile) {
      const err = new Error('User not found');
      err.status = err.statusCode = 404;
      return next(err);
    }

    if (req.user.id !== userProfile.id) {
      const err = new Error(
        'You are attempting to access a protected page for another user. DENIED.'
      );
      err.statusCode = 403;
      return next(err);
    }

    next();
  } catch (e) {
    next(e);
  }
}

function normalizeCheckbox(req, res, next) {
  if (typeof req.body.adminChecked !== 'undefined') {
    req.body.adminChecked = true;
  } else {
    req.body.adminChecked = false;
  }

  next();
}

function verifyAdminValueNotUndef(req, res, next) {
  if (typeof req.body.adminValue === 'undefined') req.body.adminValue = '';
  next();
}

module.exports = {
  isAuthAction,
  isAuthRoute,
  isAdmin,
  isSameUser,
  normalizeCheckbox,
  verifyAdminValueNotUndef,
};
