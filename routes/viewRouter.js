const { Router } = require('express');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const viewRouter = Router();

// routes

module.exports = viewRouter;
