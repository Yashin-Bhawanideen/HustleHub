// The Booking model represents the bookings collection in the database.
const Booking = require('../models/Booking');

// The Gig model is needed to look up the gig being booked and its owner.
const Gig = require('../models/Gig');

/**
 * Creates a new booking for a gig (client action).
 * Expects gigId and bookingDate (YYYY-MM-DD) in the request body.
 * Responds with 201 on success, or 400/404 if validation fails.
 */
async function createBooking(req, res, next) {
    try {
        const { gigId, bookingDate } = req.body;

        if (!gigId || !bookingDate) {
            return res.status(400).json({
                success: false,
                message: 'A gig and booking date are required.'
            });
        }

        // Convert the date string into a JavaScript Date object so it can be
        // validated and stored
        const date = new Date(bookingDate);

        if (
            Number.isNaN(date.getTime()) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) ||
            date.toISOString().slice(0, 10) !== bookingDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid booking date.'
            });
        }

        // Look up the gig by its ID to make sure it exists 
        const gig = await Gig.findById(gigId);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found.'
            });
        }

        if (gig.freelancer.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot book your own gig.'
            });
        }

        const booking = await Booking.create({
            gig: gig._id,
            client: req.user._id,
            freelancer: gig.freelancer,
            bookingDate: date,
            status: 'Pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Booking submitted successfully.',
            booking
        });
    } catch (err) {
        next(err);
    }
}
/**
 * Returns all bookings made by the logged-in client, newest first.
 */
async function getMyBookings(req, res, next) {
    try {
        const bookings = await Booking.find({
            client: req.user._id
        })
            .populate('gig', 'name title description amount')
            .populate('freelancer', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            bookings
        });
    } catch (err) {
        next(err);
    }
}
/**
 * Returns all bookings received by the logged-in freelancer, newest first.
 */
async function getFreelancerBookings(req, res, next){
    try {
        const bookings = await Booking.find({ freelancer: req.user._id})
            .populate('gig', 'name title description amount')
            .populate('client', 'name email')
            .sort({ createdAt: -1 });

            return res.status(200).json({
            success: true,
            bookings
        });
    } catch (err) {
        next(err);
    }
}
/**
 * Lets a freelancer accept or reject a booking.
 * Expects the booking ID in the URL and the new status in the request body.
 */
async function updateBookingStatus(req, res, next){
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be Accepted or Rejected.'
            });
        }

        const booking = await Booking.findOne({_id: id, freelancer: req.user._id});

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.'
            });
        }


        booking.status = status;
        await booking.save();

        return res.status (200).json({
            success: true,
            message: 'Booking updated successfully.',
            booking
        });

    } catch (err) {
        next(err);

    }

}
// Export the controller functions so they can be used in the route definitions.
module.exports = {
    createBooking,
    getMyBookings,
    getFreelancerBookings,
    updateBookingStatus
};
// Reference List
// Express Error handling. Available at: https://expressjs.com/en/guide/error-handling.html (Accessed: 12 October 2026).
// MDN Web Docs Date. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date (Accessed: 12 October 2026).
// Mongoos Queries and populate. Available at: https://mongoosejs.com/docs/populate.html (Accessed: 12 October 2026).
// OWASP Authorization Cheat Sheet. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html (Accessed: 12 October 2026).
