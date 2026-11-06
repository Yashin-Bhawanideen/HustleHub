const express = require('express');

const {
    createBooking,
    getMyBookings
} = require('../controllers/bookingController');

const {
    authenticate,
    authorizeRoles
} = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('client'));

router.post('/', createBooking);
router.get('/mine', getMyBookings);

module.exports = router;