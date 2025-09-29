const { Router } = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { isAuthAction } = require('../middleware/authMiddleware');
const { normalizePaginationInfo } = require('../middleware/pagination');
const addRouter = Router();

// routes
addRouter.post(
  '/post',
  isAuthAction,
  normalizePaginationInfo,
  postController.validateNewPost,
  postController.addPostPost
);
addRouter.post(
  '/comment/:postId',
  isAuthAction,
  commentController.validateNewComment,
  commentController.addCommentPost
);

module.exports = addRouter;
