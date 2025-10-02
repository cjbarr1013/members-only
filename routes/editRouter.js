const { Router } = require('express');
const userController = require('../controllers/userController');
const {
  isAuthAction,
  isSameUser,
  normalizeHasPic,
  normalizeCheckbox,
  verifyAdminValueNotUndef,
} = require('../middleware/authMiddleware');
const parseImageFile = require('../middleware/multerMiddleware');
const editRouter = Router();

// routes
editRouter.post(
  '/profile/:username',
  isAuthAction,
  isSameUser,
  parseImageFile,
  normalizeHasPic,
  normalizeCheckbox,
  verifyAdminValueNotUndef,
  userController.validateUserName,
  userController.validateAdmin,
  userController.validateUserProfile,
  userController.editProfilePost
);

module.exports = editRouter;
