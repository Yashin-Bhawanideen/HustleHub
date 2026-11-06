// express-validator provides body() to define validation and sanitisation
// rules for request data, and validationResult() to collect any errors
const { body, validationResult } = require('express-validator');
// ROLES is the list of allowed roles (e.g. ['client', 'freelancer']) exported
// by the User model, so the allowed values are defined in one place only.
const { ROLES } = require('../models/User');

const emailRule = body('email')
  .isString().withMessage('A valid email address is required.')
  .bail()
  .trim()
  .isEmail().withMessage('A valid email address is required.')
  .normalizeEmail({ gmail_remove_dots: false });

// Reusable rule for the role field, shared by registration and login.
const roleRule = body('role')
  .isString()
  .bail()
  .isIn(ROLES).withMessage('Role must be either "client" or "freelancer".');

// Validation rules for the registration route.
const registerRules = [
  body('name')
    .isString().withMessage('Name is required.')
    .bail()
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2 to 60 characters.')
    .escape(),
  emailRule,
  body('password')
    .isString().withMessage('Password is required.')
    .bail()
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
    .matches(/\d/).withMessage('Password must contain a number.'),
  roleRule
];

// Validation rules for the login route. The password is only checked for
// presence, because complexity rules apply when creating a password, not when
// checking an existing one.
const loginRules = [
  emailRule,
  body('password').isString().notEmpty().withMessage('Password is required.'),
  roleRule
];

/**
 * Middleware that runs after the validation rules above.
 * If any rule failed, it stops the request and responds with 400 Bad Request;
 * otherwise it passes control to the next handler (Express, n.d.).
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}

module.exports = { registerRules, loginRules, handleValidation };

// Reference List
// bcryptjs bcrypt.js: Optimized bcrypt in JavaScript. Available at: https://github.com/dcodeIO/bcrypt.js (Accessed: 12 October 2026).
// Express Writing middleware for use in Express apps. Available at: https://expressjs.com/en/guide/writing-middleware.html (Accessed: 12 October 2026).
