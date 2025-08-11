const { Router } = require('express');
const indexController = require('../controllers/indexController');
const indexRouter = Router();

// routes
indexRouter.get('/', indexController.indexGet);

module.exports = indexRouter;
