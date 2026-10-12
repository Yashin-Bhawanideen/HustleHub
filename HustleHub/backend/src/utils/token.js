// jsonwebtoken is the library used to create (sign) and check (verify)
const jwt = require('jsonwebtoken');
// Environment configuration holding the secret key and the token lifetime,
// so these values are not hardcoded in the source code.
const config = require('../config/env');

/**
 * Creates a signed JWT for an authenticated user.
 * The token is sent to the client after login and returned with later
 * requests to prove who the user is (JWT.io, n.d.).
 */
function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256'
  });
}

/**
 * Checks that a token is genuine and has not expired, then returns its
 * payload. Throws an error if the token is invalid, tampered with or expired,
 * which is handled by the authenticate middleware.
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
}

module.exports = { signToken, verifyToken };
