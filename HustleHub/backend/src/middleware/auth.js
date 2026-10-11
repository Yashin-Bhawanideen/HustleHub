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

// Role-based access control: allow only the listed roles.
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have access to this resource.' });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles };
