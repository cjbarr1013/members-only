const { body, validationResult } = require('express-validator');
const db = require('../db/queries');

function postsAllGet(req, res) {
  res.send('get all posts');
}

function postByIdGet(req, res) {
  const { id } = req.params;
  res.send(`get post with id: ${id}`);
}

function addPostPost(req, res) {
  res.redirect('/');
}

function deletePostPost(req, res) {
  res.redirect('/');
}

module.exports = {
  postsAllGet,
  postByIdGet,
  addPostPost,
  deletePostPost,
};
