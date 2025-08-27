const { Router } = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { isAdmin } = require('../middleware/authMiddleware');
const deleteRouter = Router();

// routes
deleteRouter.post('/post/:id', isAdmin, postController.deletePostPost);
deleteRouter.post(
  '/comment/:commentId/:postId',
  isAdmin,
  commentController.deleteCommentPost
);

module.exports = deleteRouter;
