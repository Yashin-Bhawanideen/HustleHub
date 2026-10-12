// Example role-protected endpoints. They prove role-based access control works
// and give the rest of the team a pattern to copy for gigs, bookings, etc.
const express = require('express');
// authenticate checks the JWT and attaches the user to req.user, while
// authorizeRoles restricts a route to specific user roles
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/client/home', authenticate, authorizeRoles('client'), (req, res) => {
  res.json({ success: true, message: 'Client area', user: req.user.toPublic() });
});

router.get('/freelancer/home', authenticate, authorizeRoles('freelancer'), (req, res) => {
  res.json({ success: true, message: 'Freelancer area', user: req.user.toPublic() });
});

module.exports = router;

// Reference List
// Express Express - Node.js web application framework. Available at: https://expressjs.com/ (Accessed: 12 October 2026).
// Express Routing. Available at: https://expressjs.com/en/guide/routing.html (Accessed: 12 October 2026).
// Express Using middleware. Available at: https://expressjs.com/en/guide/using-middleware.html (Accessed: 12 October 2026).
