const { Router } = require('express');
const userController = require('../controllers/userController');
const authRouter = Router();

// routes
authRouter.get('/register', userController.registerGet);
authRouter.post('/register', userController.registerPost);

authRouter.get('/register/profile', userController.registerProfileGet);
authRouter.post('/register/profile', userController.registerProfilePost);

authRouter.get('/login', userController.loginGet);
authRouter.post('/login', userController.loginPost);

authRouter.post('/logout', userController.logoutPost);

module.exports = authRouter;
