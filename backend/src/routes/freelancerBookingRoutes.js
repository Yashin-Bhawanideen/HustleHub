const express = require('express');

const {
    getFreelancerBookings,
    updateBookingStatus
} = require ('../controllers/bookingController');

const {
    authenticate,
    authorizeRoles
} = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('freelancer'));

router.get('/', getFreelancerBookings);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;