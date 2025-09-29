const { Router } = require('express');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const { isAuthRoute } = require('../middleware/authMiddleware');
const { normalizePaginationInfo } = require('../middleware/pagination');
const viewRouter = Router();

// routes
viewRouter.get('/posts', normalizePaginationInfo, postController.postsAllGet);
viewRouter.get('/posts/:id', isAuthRoute, postController.postByIdGet);

viewRouter.get('/profile/:username', isAuthRoute, userController.profileGet);

module.exports = viewRouter;
