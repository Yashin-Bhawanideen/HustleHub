// Express is the web framework used to build the REST API
const express = require('express');

// Controller functions that hold the logic for the freelancer's booking
// endpoints. Keeping the logic in a controller keeps this file focused on
// routing only.
const {
    getFreelancerBookings,
    updateBookingStatus
} = require ('../controllers/bookingController');

// authenticate checks the JWT and attaches the user to req.user, while
// authorizeRoles restricts a route to specific user roles.

const {
    authenticate,
    authorizeRoles
} = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('freelancer'));

// GET /api/freelancer/bookings
// Returns all bookings that clients have made for this freelancer's gigs.
router.get('/', getFreelancerBookings);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
