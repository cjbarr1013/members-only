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
const { reconfigureImage, formatDate } = require('./utils/helpers');

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
    saveUninitialized: true,
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
  res.locals.currentUser = req.user;
  res.locals.messages = req.flash();
  res.locals.reconfigureImage = reconfigureImage;
  res.locals.formatDate = formatDate;

  if (!Array.isArray(req.session.prevPaths)) {
    req.session.prevPaths = [];
  }
  req.session.prevPaths.push(req.originalUrl);
  if (req.session.prevPaths.length > 10) {
    req.session.prevPaths = req.session.prevPaths.slice(-10);
  }
  next();
});

// routes
app.use('/add', addRouter);
app.use('/auth', authRouter);
app.use('/delete', deleteRouter);
app.use('/edit', editRouter);
app.use('/view', viewRouter);
app.use('/', indexRouter);

// error handling
app.use((req, res) => {
  return res.status(404).send('There is no page here, dumbass.');
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status !== 404) console.error(err);
  res.status(status);
  return res.send(err.message);
});

module.exports = app;
