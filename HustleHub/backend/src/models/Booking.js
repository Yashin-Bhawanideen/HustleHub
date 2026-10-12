// Mongoose is the ODM (Object Data Modelling) library used to define the
// structure of documents and interact with the database
const mongoose = require('mongoose');

// Define the schema (structure) of a booking document. A schema sets out the
// fields, their data types and any validation rules
const bookingSchema = new mongoose.Schema(
    {
        gig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gig',
            required: true
        },

        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // The user (with the freelancer role) who owns the gig and must
        // accept or reject the booking.
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        bookingDate: {
            type: Date,
            required: true
        },

        // The current state of the booking.
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        }
    },
    {
        timestamps: true
    }
);
// Create the Booking model from the schema and export it so the controllers
// can use it. Mongoose maps the 'Booking' model to a 'bookings' collection.
module.exports = mongoose.model('Booking', bookingSchema);

// Reference List
// Mongoose Schemas. Available at: https://mongoosejs.com/docs/guide.html (Accessed: 12 October 2026).
// Mongoose Populate. Available at: https://mongoosejs.com/docs/populate.html (Accessed: 12 October 2026).
// Mongoose SchemaTypes: String. Available at: https://mongoosejs.com/docs/schematypes.html#strings (Accessed: 12 October 2026).
// Mongoose Timestamps. Available at: https://mongoosejs.com/docs/timestamps.html (Accessed: 12 October 2026).
