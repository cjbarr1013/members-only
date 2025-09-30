const { body, validationResult } = require('express-validator');
const db = require('../db/queries');

const validateNewPost = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('You must enter a title for your post.')
    .bail()
    .isLength({ max: 250 })
    .withMessage('Your post title cannot exceed 250 characters.'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('You must enter a message for your post.')
    .bail()
    .isLength({ max: 5000 })
    .withMessage('Your post title cannot exceed 5000 characters.'),
];

async function postsAllGet(req, res, next) {
  // From database: list of all posts (post_id, title, message, COUNT(comments),
  //    added, username, pic_url, admin)

  const { startIndex, limit, sort } = res.pagination;
  console.log('Post get', req.session);

  try {
    const posts = await db.getAllPosts(startIndex, limit, sort);
    return res.render('layouts/main', {
      page: 'posts/all',
      title: 'Homepage',
      posts,
      pagination: res.pagination,
      formData: {
        title: '',
        message: '',
      },
      showAddPostModal: false,
    });
  } catch (err) {
    return next(err);
  }
}

async function postByIdGet(req, res, next) {
  // From req: id
  // To database: id
  // From database: title, message, COUNT(comments),
  //    list of all comments (id, message, added, username, pic_url),
  //    added, username, pic_url, admin

  const { id } = req.params;

  try {
    if (!Number.isInteger(parseInt(id)) || id < 0) return next();

    const post = await db.getPostById(id);

    if (!post) return next();

    return res.render('layouts/main', {
      page: 'posts/byId',
      title: post.title,
      post,
      commentValue: '',
    });
  } catch (err) {
    return next(err);
  }
}

async function addPostPost(req, res, next) {
  // From locals: user_id
  // From req: title, message
  // To database: title, message, user_id

  const { title, message } = req.body;
  const { page, limit, sort, startIndex } = res.pagination;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const posts = await db.getAllPosts(startIndex, limit, sort);
    return res.status(400).render('layouts/main', {
      page: 'posts/all',
      title: 'Homepage',
      posts,
      pagination: res.pagination,
      formData: {
        title,
        message,
      },
      showAddPostModal: true,
      errors: errors.array(),
    });
  }

  try {
    await db.addPost(title, message, req.user.id);
    req.flash('success', 'Post has successfully been submitted!');
    return res.redirect(`/view/posts?page=${page}&limit=${limit}&sort=${sort}`);
  } catch (err) {
    return next(err);
  }
}

async function deletePostPost(req, res, next) {
  // From req: id
  // To database: id

  const { id } = req.params;

  try {
    await db.deletePost(id);
    req.flash('success', 'Post has successfully been deleted!');
    if (req.session.prevPath === `/view/posts/${id}`) {
      return res.redirect('/view/posts');
    }
    return res.redirect(req.session.prevPath);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  validateNewPost,
  postsAllGet,
  postByIdGet,
  addPostPost,
  deletePostPost,
};
