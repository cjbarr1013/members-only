const { Router } = require('express');
const userController = require('../controllers/userController');
const editRouter = Router();

// routes
editRouter.get('/profile/:username', userController.editProfileGet);
editRouter.post('/profile/:username', userController.editProfilePost);

module.exports = editRouter;
