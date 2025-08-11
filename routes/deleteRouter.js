const { Router } = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const deleteRouter = Router();

// routes
deleteRouter.post('/post/:id', postController.deletePostPost);
deleteRouter.post('/comment/:id', commentController.deleteCommentPost);

module.exports = deleteRouter;
