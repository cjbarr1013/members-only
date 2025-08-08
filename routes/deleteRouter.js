const { Router } = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const deleteRouter = Router();

// routes

module.exports = deleteRouter;
