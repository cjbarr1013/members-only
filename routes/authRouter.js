const { Router } = require('express');
const passport = require('passport');
const userController = require('../controllers/userController');
const {
  isAuthAction,
  isAuthRoute,
  isNotAuthRoute,
  isNewlyRegistered,
  normalizeHasPic,
  normalizeCheckbox,
  verifyAdminValueNotUndef,
} = require('../middleware/authMiddleware');
const parseImageFile = require('../middleware/multerMiddleware');
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
  parseImageFile,
  normalizeHasPic,
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
    keepSessionInfo: true, // needed so error/success msgs persist to redirect
  })
);

authRouter.post('/logout', isAuthRoute, userController.logoutPost);

module.exports = authRouter;
