const { Router } = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const addRouter = Router();

// routes
addRouter.post('/post', postController.addPostPost);
addRouter.post('/comment', commentController.addCommentPost);

module.exports = addRouter;
