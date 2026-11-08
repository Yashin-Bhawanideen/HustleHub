// bcryptjs is a pure JavaScript library for hashing and comparing passwords.
// Passwords are hashed so they are never stored in plain text .
const bcrypt = require('bcryptjs');
const User = require('../models/User');
// Environment configuration (e.g. the number of salt rounds used when hashing).
const config = require('../config/env');
const { signToken } = require('../utils/token');
const { logActivity } = require('../utils/activityLogger');

// security feature 1
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

// Compared against when the email doesn't exist, so response time doesn't
// reveal whether an account exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

/**
 * Registers a new user account.
 * Expects name, email, password and role in the request body.
 * Responds with 201 on success or 409 if the email is already in use.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      // Deliberately vague: don't confirm which emails are registered.
      return res.status(409).json({ success: false, message: 'Unable to register with the provided details.' });
    }

    const hashed = await bcrypt.hash(password, config.saltRounds);
    const user = await User.create({ name, email, password: hashed, role });

    return res.status(201).json({
      success: true,
      message: 'Account created. You can now log in.',
      user: user.toPublic()
    });
  } catch (err) {
    next(err);
  }
}
/**
 * Logs a user in.
 * Expects email, password and role in the request body.
 * Responds with a JWT and the user's public details on success.
 */
async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password +failedLoginAttempts +lockUntil');

    // security feature 1
    if (user && user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      await logActivity({
        actor: user._id,
        action: 'LOGIN_BLOCKED_LOCKED',
        entityType: 'User',
        entityId: user._id,
        details: 'Login attempt rejected because the account is locked.',
        ipAddress: req.ip
      });
      return res.status(423).json({
        success: false,
        message: 'Too many failed login attempts. Try again in ' + minutesLeft + ' minute(s).'
      });
    }

    const hashToCompare = user ? user.password : DUMMY_HASH;
    const passwordMatches = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordMatches) {
      // security feature 1
      if (user) {
        const attempts = (user.failedLoginAttempts || 0) + 1;
        const locked = attempts >= MAX_FAILED_ATTEMPTS;
        await User.updateOne(
          { _id: user._id },
          locked
            ? { $set: { failedLoginAttempts: 0, lockUntil: new Date(Date.now() + LOCK_DURATION_MS) } }
            : { $set: { failedLoginAttempts: attempts } }
        );
        await logActivity({
          actor: user._id,
          action: locked ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
          entityType: 'User',
          entityId: user._id,
          details: locked
            ? 'Account locked for 15 minutes after ' + MAX_FAILED_ATTEMPTS + ' failed login attempts.'
            : 'Failed login attempt ' + attempts + ' of ' + MAX_FAILED_ATTEMPTS + '.',
          ipAddress: req.ip
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // security feature 1
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0, lockUntil: null } });
    }

    // Credentials are correct, but the person picked the wrong role on the form.
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: 'This account is registered as a ' + user.role + '. Select "' + user.role + '" and try again.'
      });
    }

    const token = signToken(user);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toPublic()
    });
  } catch (err) {
    next(err);
  }
}

// Returns the currently authenticated user (used by the frontend to validate a stored token).
function me(req, res) {
  res.status(200).json({ success: true, user: req.user.toPublic() });
}

// security feature 2
async function logout(req, res, next) {
  try {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    await logActivity({
      actor: req.user._id,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: req.user._id,
      details: 'User logged out. All existing tokens for this account were revoked.',
      ipAddress: req.ip
    });
    return res.status(200).json({ success: true, message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, logout };

// Reference List
// bcryptjs bcrypt.js: Optimized bcrypt in JavaScript. Available at: https://github.com/dcodeIO/bcrypt.js (Accessed: 12 October 2026).
// Express Error handling. Available at: https://expressjs.com/en/guide/error-handling.html (Accessed: 12 October 2026).
// JWT.io Introduction to JSON Web Tokens. Available at: https://jwt.io/introduction (Accessed: 12 October 2026).
// Mongoose Schema types: select. Available at: https://mongoosejs.com/docs/api/schematype.html (Accessed: 12 October 2026).
// OWASP  Authentication Cheat Sheet. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html (Accessed: 12 October 2026).
