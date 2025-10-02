const { check, body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../db/queries');
const { uploadImageBuffer } = require('../utils/helpers');

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
];

const validateAdmin = [
  body('adminValue')
    .trim()
    .toLowerCase()
    .custom((value, { req }) => {
      if (!req.body.adminChecked) return true;
      if (value === process.env.ADMIN_SECRET) return true;
      throw new Error('Incorrect secret code for admin privileges.');
    }),
];

const validateUserName = [
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
];

const validateUserProfile = [
  body('bio')
    .optional({ checkFalsy: true })
    .isLength({ max: 250 })
    .withMessage('Bio cannot exceed 250 characters.'),
  body('loc')
    .optional({ checkFalsy: true })
    .isLength({ max: 30 })
    .withMessage('Location cannot exceed 30 characters.'),
  body('birthday')
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true })
    .withMessage('Birthday must be a valid date (YYYY-MM-DD).'),
  check('pic').custom(async (value, { req }) => {
    if (!req.file) return true;
    try {
      const result = await uploadImageBuffer(
        req.file.buffer,
        req.user.username
      );
      req.body.hasPic = true;
      req.cloudinaryUpload = result;
      return true;
    } catch {
      throw new Error('File failed to upload.');
    }
  }),
];

function registerGet(req, res) {
  return res.render('layouts/auth', {
    page: 'register',
    title: 'Register',
    errors: [],
    formData: {
      first: '',
      last: '',
      username: '',
      adminChecked: false,
      adminValue: '',
    },
  });
}

async function registerPost(req, res, next) {
  // From req: first, last, username, password, password_verify, admin
  // To database: first, last, username, hashed_password, admin
  // From database: user

  const { first, last, username, password, adminChecked, adminValue } =
    req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('layouts/auth', {
      page: 'register',
      title: 'Register',
      errors: errors.array(),
      formData: { first, last, username, adminChecked, adminValue },
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.addUser(
      first,
      last,
      username,
      hashedPassword,
      adminChecked
    );

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      req.session.justRegistered = user.id;
      return res.redirect('/auth/register/profile');
    });
  } catch (err) {
    return next(err);
  }
}

function registerProfileGet(req, res) {
  // From locals: req.user.id
  delete req.session.justRegistered;
  return res.render('layouts/auth', {
    page: 'registerProfile',
    title: 'Add Profile Info',
    errors: [],
    formData: {
      bio: '',
      loc: '',
      birthday: '',
    },
  });
}

async function registerProfilePost(req, res, next) {
  // From locals: req.user.id
  // From req: pic_url, bio, loc, birthday
  // To database: id, pic_url, bio, loc, birthday

  const { hasPic, bio, loc, birthday } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('layouts/auth', {
      page: 'registerProfile',
      title: 'Add Profile Info',
      errors: errors.array(),
      formData: {
        bio,
        loc,
        birthday,
      },
    });
  }

  try {
    await db.addUserInfo(
      req.user.id,
      req.user.admin,
      hasPic,
      req.cloudinaryUpload?.version || null,
      bio,
      loc,
      birthday || null
    );
    return res.redirect('/');
  } catch (err) {
    return next(err);
  }
}

function loginGet(req, res) {
  const attemptedUsername = req.session.attemptedUsername || '';
  delete req.session.attemptedUsername;

  return res.render('layouts/auth', {
    page: 'login',
    title: 'Log In',
    formData: {
      username: attemptedUsername,
    },
  });
}

function logoutPost(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'You have successfully logged out.');
    return res.redirect('/view/posts');
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
    if (!userProfile) {
      return next();
    }
    return res.render('layouts/main', {
      page: 'profile/view',
      title: `${username}'s Profile`,
      user: userProfile,
      errors: [],
      formData: {
        first: userProfile.info.first,
        last: userProfile.info.last,
        adminChecked: false,
        adminValue: '',
        bio: userProfile.info.bio,
        loc: userProfile.info.loc,
        birthday: userProfile.info.birthday,
      },
      showEditProfileModal: false,
    });
  } catch (err) {
    return next(err);
  }
}

async function editProfilePost(req, res, next) {
  // From locals: req.user.id
  // From req: pic_url, bio, loc, birthday
  // To database: id, pic_url, bio, loc, birthday

  const { first, last, adminChecked, adminValue, hasPic, bio, loc, birthday } =
    req.body;
  const { username } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const userProfile = await db.getUserProfileByUsername(username);
    return res.status(400).render('layouts/main', {
      page: 'profile/view',
      title: `${username}'s Profile`,
      user: userProfile,
      errors: errors.array(),
      formData: {
        first,
        last,
        adminChecked,
        adminValue,
        bio,
        loc,
        birthday,
      },
      showEditProfileModal: true,
    });
  }

  const isAdmin = req.user.admin || adminChecked ? true : false;

  try {
    await db.editUserInfo(
      req.user.id,
      first,
      last,
      isAdmin,
      hasPic,
      req.cloudinaryUpload?.version || null,
      bio,
      loc,
      birthday || null
    );
    return res.redirect(`/view/profile/${req.user.username}`);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  validateNewUser,
  validateAdmin,
  validateUserName,
  validateUserProfile,
  registerGet,
  registerPost,
  registerProfileGet,
  registerProfilePost,
  loginGet,
  logoutPost,
  profileGet,
  editProfilePost,
};
