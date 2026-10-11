const { body, validationResult } = require('express-validator');
const { ROLES } = require('../models/User');

const emailRule = body('email')
  .isString().withMessage('A valid email address is required.')
  .bail()
  .trim()
  .isEmail().withMessage('A valid email address is required.')
  .normalizeEmail({ gmail_remove_dots: false });

const roleRule = body('role')
  .isString()
  .bail()
  .isIn(ROLES).withMessage('Role must be either "client" or "freelancer".');

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

const loginRules = [
  emailRule,
  body('password').isString().notEmpty().withMessage('Password is required.'),
  roleRule
];

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
