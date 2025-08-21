const { Router } = require('express');
const userController = require('../controllers/userController');
const {
  isAuthAction,
  isAuthRoute,
  isSameUser,
} = require('../middleware/authMiddleware');
const editRouter = Router();

// routes
editRouter.get(
  '/profile/:username',
  isAuthRoute,
  isSameUser,
  userController.editProfileGet
);
editRouter.post(
  '/profile/:username',
  isAuthAction,
  isSameUser,
  userController.validateUserProfile,
  userController.editProfilePost
);

module.exports = editRouter;
