const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Gig', gigSchema);