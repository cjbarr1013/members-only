const { Router } = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { isAuthAction } = require('../middleware/authMiddleware');
const deleteRouter = Router();

// routes
deleteRouter.post('/post/:id', isAuthAction, postController.deletePostPost);
deleteRouter.post(
  '/comment/:commentId/:postId',
  isAuthAction,
  commentController.deleteCommentPost
);

module.exports = deleteRouter;
