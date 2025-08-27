const { Router } = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const { isAuthAction, isAuthRoute } = require('../middleware/authMiddleware');
const authRouter = Router();

// routes
authRouter.get('/register', userController.registerGet);
authRouter.post(
  '/register',
  userController.validateNewUser,
  userController.registerPost
);

authRouter.get(
  '/register/profile',
  isAuthRoute,
  userController.registerProfileGet
);
authRouter.post(
  '/register/profile',
  isAuthAction,
  userController.validateUserProfile,
  userController.registerProfilePost
);

authRouter.get('/login', userController.loginGet);
authRouter.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
  })
);

authRouter.get('/logout', isAuthRoute, userController.logoutGet);

module.exports = authRouter;
