const { body, validationResult } = require('express-validator');
const db = require('../db/queries');

function registerGet(req, res) {
  res.send('get register form');
}

function registerPost(req, res) {
  res.redirect('/');
}

function registerProfileGet(req, res) {
  res.send('get register profile form');
}

function registerProfilePost(req, res) {
  res.redirect('/');
}

function loginGet(req, res) {
  res.send('get login form');
}

function loginPost(req, res) {
  res.redirect('/');
}

function logoutPost(req, res) {
  res.redirect('/');
}

function profileGet(req, res) {
  const { username } = req.params;
  res.send(`get profile with username: ${username}`);
}

function editProfileGet(req, res) {
  const { username } = req.params;
  res.send(`get edit profile form for user: ${username}`);
}

function editProfilePost(req, res) {
  res.redirect('/');
}

module.exports = {
  registerGet,
  registerPost,
  registerProfileGet,
  registerProfilePost,
  loginGet,
  loginPost,
  logoutPost,
  profileGet,
  editProfileGet,
  editProfilePost,
};
