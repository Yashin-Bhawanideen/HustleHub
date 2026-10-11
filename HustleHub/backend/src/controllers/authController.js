const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/env');
const { signToken } = require('../utils/token');

// Compared against when the email doesn't exist, so response time doesn't
// reveal whether an account exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

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

async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password');
    const hashToCompare = user ? user.password : DUMMY_HASH;
    const passwordMatches = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
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

module.exports = { register, login, me };
