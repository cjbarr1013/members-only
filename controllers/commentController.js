const { body, validationResult } = require('express-validator');
const db = require('../db/queries');

const validateNewComment = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('You must enter a comment.')
    .bail()
    .isLength({ max: 2000 })
    .withMessage('Length of comment cannot exceed 2000 characters.'),
];

async function addCommentPost(req, res, next) {
  // From locals: user_id
  // From req: message, post_id
  // To database: message, post_id, user_id

  const { message } = req.body;
  const { postId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const post = await db.getPostById(postId);
    return res.status(400).render('layouts/main', {
      page: 'posts/byId',
      title: post.title,
      post,
      commentValue: message,
      errors: errors.array(),
    });
  }

  try {
    await db.addComment(message, postId, req.user.id);
    req.flash('success', 'Comment has successfully been submitted!');
    return res.redirect(`/view/posts/${postId}`);
  } catch (err) {
    return next(err);
  }
}

async function deleteCommentPost(req, res, next) {
  // From req: post_id, comment_id
  // To database: comment_id

  const { commentId, postId } = req.params;

  try {
    await db.deleteComment(commentId);
    req.flash('success', 'Comment has successfully been deleted!');
    return res.redirect(`/view/posts/${postId}`);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  validateNewComment,
  addCommentPost,
  deleteCommentPost,
};
