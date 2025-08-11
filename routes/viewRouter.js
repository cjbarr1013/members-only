const { Router } = require('express');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const viewRouter = Router();

// routes
viewRouter.get('/posts', postController.postsAllGet);
viewRouter.get('/posts/:id', postController.postByIdGet);

viewRouter.get('/profile/:username', userController.profileGet);

module.exports = viewRouter;
