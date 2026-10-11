const Gig = require('../models/Gig');

async function createGig(req, res, next) {
  try {
    const { name, title, description, amount } = req.body;

    const gig = await Gig.create({
      name,
      title,
      description,
      amount,
      freelancer: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Gig created successfully.',
      gig
    });
  } catch (err) {
    next(err);
  }
}

async function getMyGigs(req, res, next) {
  try {
    const gigs = await Gig.find({
      freelancer: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      gigs
    });
  } catch (err) {
    next(err);
  }
}

async function getGig(req, res, next) {
  try {
    const gig = await Gig.findOne({
      _id: req.params.id,
      freelancer: req.user._id
    });

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found.'
      });
    }

    return res.status(200).json({
      success: true,
      gig
    });
  } catch (err) {
    next(err);
  }
}

async function updateGig(req, res, next) {
  try {
    const { name, title, description, amount } = req.body;

    const gig = await Gig.findOne({
      _id: req.params.id,
      freelancer: req.user._id
    });

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found.'
      });
    }

    gig.name = name;
    gig.title = title;
    gig.description = description;
    gig.amount = amount;

    await gig.save();

    return res.status(200).json({
      success: true,
      message: 'Gig updated successfully.',
      gig
    });
  } catch (err) {
    next(err);
  }
}

async function deleteGig(req, res, next) {
  try {
    const gig = await Gig.findOneAndDelete({
      _id: req.params.id,
      freelancer: req.user._id
    });

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Gig deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createGig,
  getMyGigs,
  getGig,
  updateGig,
  deleteGig
};