// Express is the web framework used to build the REST API
const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { registerRules, loginRules, handleValidation } = require('../middleware/validators');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
// Middleware runs left to right: validate the input, check for errors, and
// only then call the register controller 
router.post('/register', registerRules, handleValidation, register);
// POST /api/auth/login
// Same pattern: validate the input first, then log the user in.
router.post('/login', loginRules, handleValidation, login);
// GET /api/auth/me
// authenticate runs first, so only users with a valid token can reach me().
// The frontend uses this to check that a stored token is still valid.
router.get('/me', authenticate, me);

module.exports = router;

// Reference List
// Express  Express - Node.js web application framework. Available at: https://expressjs.com/ (Accessed: 12 October 2026).
// Express  Routing. Available at: https://expressjs.com/en/guide/routing.html (Accessed: 12 October 2026).
// Express  Using middleware. Available at: https://expressjs.com/en/guide/using-middleware.html (Accessed: 12 October 2026).
// express-validator Getting started. Available at: https://express-validator.github.io/docs/ (Accessed: 12 October 2026).
