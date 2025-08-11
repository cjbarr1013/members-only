const { body, validationResult } = require('express-validator');
const db = require('../db/queries');

function addCommentPost(req, res) {
  res.redirect('/');
}

function deleteCommentPost(req, res) {
  res.redirect('/');
}

module.exports = {
  addCommentPost,
  deleteCommentPost,
};
