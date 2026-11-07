const Booking = require('../models/Booking');
const Gig = require('../models/Gig');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityLogger');

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

        await Notification.create({
            recipient: gig.freelancer,
            type: 'booking_created',
            title: 'New booking request',
            message: `${req.user.name} has requested to book your gig: ${gig.title}.`,
            relatedBooking: booking._id
        });

        await logActivity({
            actor: req.user._id,
            action: 'BOOKING_CREATED',
            entityType: 'Booking',
            entityId: booking._id,
            details: `Client submitted a booking request for ${gig.title}.`,
            ipAddress: req.ip
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

async function getFreelancerBookings(req, res, next) {
    try {
        const bookings = await Booking.find({
            freelancer: req.user._id
        })
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

async function updateBookingStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be Accepted or Rejected.'
            });
        }

        const booking = await Booking.findOne({
            _id: id,
            freelancer: req.user._id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.'
            });
        }

        if (booking.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'This booking has already been processed.'
            });
        }

        booking.status = status;
        await booking.save();

        const gig = await Gig.findById(booking.gig);

        const notificationType = status === 'Accepted'
            ? 'booking_accepted'
            : 'booking_rejected';

        const notificationTitle = status === 'Accepted'
            ? 'Booking accepted'
            : 'Booking rejected';

        const notificationMessage = status === 'Accepted'
            ? `Your booking for ${gig?.title || 'a gig'} has been accepted.`
            : `Your booking for ${gig?.title || 'a gig'} has been rejected.`;

        await Notification.create({
            recipient: booking.client,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            relatedBooking: booking._id
        });

        await logActivity({
            actor: req.user._id,
            action: status === 'Accepted'
                ? 'BOOKING_ACCEPTED'
                : 'BOOKING_REJECTED',
            entityType: 'Booking',
            entityId: booking._id,
            details: `Freelancer changed booking status to ${status}.`,
            ipAddress: req.ip
        });

        return res.status(200).json({
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
// Reference List
// Express Error handling. Available at: https://expressjs.com/en/guide/error-handling.html (Accessed: 12 October 2026).
// MDN Web Docs Date. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date (Accessed: 12 October 2026).
// Mongoos Queries and populate. Available at: https://mongoosejs.com/docs/populate.html (Accessed: 12 October 2026).
// OWASP Authorization Cheat Sheet. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html (Accessed: 12 October 2026).
