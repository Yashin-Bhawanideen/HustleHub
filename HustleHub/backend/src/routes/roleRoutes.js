// Example role-protected endpoints. They prove role-based access control works
// and give the rest of the team a pattern to copy for gigs, bookings, etc.
const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/client/home', authenticate, authorizeRoles('client'), (req, res) => {
  res.json({ success: true, message: 'Client area', user: req.user.toPublic() });
});

router.get('/freelancer/home', authenticate, authorizeRoles('freelancer'), (req, res) => {
  res.json({ success: true, message: 'Freelancer area', user: req.user.toPublic() });
});

module.exports = router;
