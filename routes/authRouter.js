const { Router } = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const {
  isAuthAction,
  isAuthRoute,
  isNotAuthRoute,
  isNewlyRegistered,
  normalizeCheckbox,
  verifyAdminValueNotUndef,
} = require('../middleware/authMiddleware');
const authRouter = Router();

// routes
authRouter.get('/register', isNotAuthRoute, userController.registerGet);
authRouter.post(
  '/register',
  normalizeCheckbox,
  verifyAdminValueNotUndef,
  userController.validateNewUser,
  userController.validateAdmin,
  userController.registerPost
);

authRouter.get(
  '/register/profile',
  isAuthRoute,
  isNewlyRegistered,
  userController.registerProfileGet
);
authRouter.post(
  '/register/profile',
  isAuthAction,
  userController.validateUserProfile,
  userController.registerProfilePost
);

authRouter.get('/login', isNotAuthRoute, userController.loginGet);
authRouter.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/view/posts',
    failureRedirect: '/auth/login',
    successFlash: true,
    failureFlash: true,
    keepSessionInfo: true,
  })
);

authRouter.post('/logout', isAuthRoute, userController.logoutPost);

module.exports = authRouter;
