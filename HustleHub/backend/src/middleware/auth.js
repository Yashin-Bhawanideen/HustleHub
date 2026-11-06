// The User model represents the users collection in the database.
const User = require('../models/User');
const { verifyToken } = require('../utils/token');

// Requires a valid "Authorization: Bearer <jwt>" header.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Declared outside the inner try block so it can be used afterwards.
    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    // Look the user up so deleted accounts can't keep using an old token.
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role-based access control (RBAC) middleware factory.
 * Takes the roles that are allowed (e.g. 'client', 'freelancer') and returns
 * a middleware function that only lets those roles through (OWASP, n.d.).
 * The rest parameter (...allowedRoles) collects all arguments into an array.
 * It must run after authenticate(), because it relies on req.user.
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have access to this resource.' });
    }
    next();
  };
}
// Export both middleware functions so they can be used in the route files
module.exports = { authenticate, authorizeRoles };
