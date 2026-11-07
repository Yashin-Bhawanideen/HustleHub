const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: [
                'booking_created',
                'booking_accepted',
                'booking_rejected'
            ],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        relatedBooking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            default: null
        },
        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
