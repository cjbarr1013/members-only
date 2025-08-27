const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../db/queries');

const validateNewUser = [
  body('first')
    .trim()
    .notEmpty()
    .withMessage('You must enter a first name.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters.'),
  body('last')
    .trim()
    .notEmpty()
    .withMessage('You must enter a last name.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters.'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('You must enter a username.')
    .bail()
    .matches(/^[0-9A-Za-z]{6,16}$/)
    .withMessage(
      'Username must be between 6 and 16 characters and only contain letters and numbers'
    )
    .bail()
    .custom(async (value) => {
      const user = await db.getUserByUsername(value);
      if (user) {
        throw new Error('Username is already in use.');
      }
    }),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must enter a password.')
    .bail()
    .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/)
    .withMessage(
      'Password must be between 8 and 32 characters, have one uppercase letter, one lowercase letter, one digit and one special character.'
    ),
  body('passwordVerify')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
  body('admin')
    .trim()
    .custom((value, { req }) => {
      if (req.body.adminChecked && value !== process.env.ADMIN_SECRET_CODE) {
        throw new Error('Incorrect secret code for admin privileges.');
      }
      return true;
    }),
];

const validateUserProfile = [
  body('admin')
    .trim()
    .custom((value, { req }) => {
      if (req.body.adminChecked && value !== process.env.ADMIN_SECRET_CODE) {
        throw new Error('Incorrect secret code for admin privileges.');
      }
      return true;
    }),
  body('picUrl')
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Picture URL must be a valid URL.'),
  body('bio')
    .optional({ checkFalsy: true })
    .isLength({ max: 250 })
    .withMessage('Bio cannot exceed 250 characters.'),
  body('loc')
    .optional({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('Location cannot exceed 50 characters.'),
];

function registerGet(req, res) {
  // return res.render('', {
  //   title: '',
  //   ...
  // })
  return res.send('get register form');
}

async function registerPost(req, res, next) {
  // From req: first, last, username, password, password_verify, admin
  // To database: first, last, username, hashed_password, admin
  // From database: user

  const { first, last, username, password, admin } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // return res.status(400).render('', {
    //   ...
    //   errors: errors.array(),
    // })
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.addUser(first, last, username, hashedPassword, admin);

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/auth/register/profile');
    });
  } catch (err) {
    return next(err);
  }
}

function registerProfileGet(req, res) {
  // From locals: req.user.id

  // return res.render('', {
  //   title: '',
  //   ...
  // })
  return res.send('get user profile form');
}

async function registerProfilePost(req, res, next) {
  // From locals: req.user.id
  // From req: pic_url, bio, loc, birthday
  // To database: id, pic_url, bio, loc, birthday

  const { picUrl, bio, loc, birthday } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // return res.status(400).render('', {
    //   ...
    //   errors: errors.array(),
    // })
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await db.editUserInfo(
      req.user.id,
      req.user.admin,
      picUrl,
      bio,
      loc,
      birthday
    );
    return res.redirect('/');
  } catch (err) {
    return next(err);
  }
}

function loginGet(req, res) {
  // return res.render('', {
  //   title: '',
  //   ...
  // })
  return res.send('get login form');
}

function logoutGet(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/');
  });
}

async function profileGet(req, res, next) {
  // From req: username
  // To database: username
  // From database: first, last, admin, pic_url, bio, loc, birthday,
  //    list of posts (id, title, message, COUNT(comments), added),
  //    list of comments (id, message, added, post_id, post_title)

  const { username } = req.params;

  try {
    const userProfile = await db.getUserProfileByUsername(username);
    // return res.render('', {
    //   title: '',
    //   ...
    // })
    return res.send(userProfile);
  } catch (err) {
    return next(err);
  }
}

async function editProfileGet(req, res, next) {
  // From req: username
  // To database: username
  // From database: pic_url, bio, loc, birthday

  const { username } = req.params;

  try {
    const userInfo = await db.getUserInfoByUsername(username);
    // return res.render('', {
    //   title: '',
    //   ...
    // })
    return res.send(userInfo);
  } catch (err) {
    return next(err);
  }
}

async function editProfilePost(req, res, next) {
  // From locals: req.user.id
  // From req: pic_url, bio, loc, birthday
  // To database: id, pic_url, bio, loc, birthday

  const { admin, picUrl, bio, loc, birthday } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // return res.status(400).render('', {
    //   ...
    //   errors: errors.array(),
    // })
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await db.editUserInfo(req.user.id, admin, picUrl, bio, loc, birthday);
    return res.redirect(`/view/profile/${req.user.username}`);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  validateNewUser,
  validateUserProfile,
  registerGet,
  registerPost,
  registerProfileGet,
  registerProfilePost,
  loginGet,
  logoutGet,
  profileGet,
  editProfileGet,
  editProfilePost,
};
