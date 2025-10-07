require('dotenv').config();
const express = require('express');
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db/pool');
const addRouter = require('./routes/addRouter');
const authRouter = require('./routes/authRouter');
const deleteRouter = require('./routes/deleteRouter');
const editRouter = require('./routes/editRouter');
const indexRouter = require('./routes/indexRouter');
const viewRouter = require('./routes/viewRouter');
const { getImageUrlSm, getImageUrlLg, formatDate } = require('./utils/helpers');

// app initialization
const app = express();

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// access public assets
const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

// allows req.body to access submitted HTML form data
app.use(express.urlencoded({ extended: true }));

// sessions and authentication
const sessionStore = new pgSession({
  pool,
  createTableIfMissing: true,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // equals one day
    },
  })
);

require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// misc. middleware and variables
app.use((req, res, next) => {
  // locals
  res.locals.currentUser = req.user;
  res.locals.messages = req.flash();
  res.locals.getImgUrlSm = getImageUrlSm;
  res.locals.getImgUrlLg = getImageUrlLg;
  res.locals.formatDate = formatDate;
  res.locals.path = req.path;

  // session
  if (req.method === 'GET' && req.originalUrl.startsWith('/view')) {
    req.session.prevPath = req.originalUrl;
  }
  if (req.query.sort) req.session.sort = req.query.sort;
  if (req.query.limit) req.session.limit = parseInt(req.query.limit);
  next();
});

// serve Flowbite directly from node_modules (no manual copying)
app.use(
  '/vendor/flowbite',
  express.static(path.join(__dirname, 'node_modules/flowbite/dist'))
);

// routes
app.use('/add', addRouter);
app.use('/auth', authRouter);
app.use('/delete', deleteRouter);
app.use('/edit', editRouter);
app.use('/view', viewRouter);
app.use('/', indexRouter);

// error handling
app.use((req, res) => {
  return res
    .status(404)
    .render('layouts/error', { title: '404 Not Found', page: '404' });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status !== 404) console.error(err);
  return res.status(status).json({ error: { status, message: err.message } });
});

module.exports = app;
