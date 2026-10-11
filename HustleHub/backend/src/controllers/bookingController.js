const Booking = require('../models/Booking');
const Gig = require('../models/Gig');

async function createBooking(req, res, next) {
    try {
        const { gigId, bookingDate } = req.body;

        if (!gigId || !bookingDate) {
            return res.status(400).json({
                success: false,
                message: 'A gig and booking date are required.'
            });
        }

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

module.exports = {
    createBooking,
    getMyBookings,
    getFreelancerBookings,
    updateBookingStatus
};