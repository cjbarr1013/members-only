require('dotenv').config();
const express = require('express');
const path = require('path');
// const passport = require("passport");
// const session = require("express-session");
const addRouter = require('./routes/addRouter');
const authRouter = require('./routes/authRouter');
const deleteRouter = require('./routes/deleteRouter');
const editRouter = require('./routes/editRouter');
const indexRouter = require('./routes/indexRouter');
const viewRouter = require('./routes/viewRouter');

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

// passport
// app.use(session({ /* session config */ }));
// app.use(passport.session());

// routes
app.use('/add', addRouter);
app.use('/auth', authRouter);
app.use('/delete', deleteRouter);
app.use('/edit', editRouter);
app.use('/view', viewRouter);
app.use('/', indexRouter);

// error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});

// server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`My first Express app - listening on port ${PORT}!`);
});
