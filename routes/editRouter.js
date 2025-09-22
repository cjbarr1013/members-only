const { Router } = require('express');
const userController = require('../controllers/userController');
const {
  isAuthAction,
  isSameUser,
  normalizeCheckbox,
  verifyAdminValueNotUndef,
} = require('../middleware/authMiddleware');
const editRouter = Router();

// routes
editRouter.post(
  '/profile/:username',
  isAuthAction,
  isSameUser,
  normalizeCheckbox,
  verifyAdminValueNotUndef,
  userController.validateUserName,
  userController.validateAdmin,
  userController.validateUserProfile,
  userController.editProfilePost
);

module.exports = editRouter;
