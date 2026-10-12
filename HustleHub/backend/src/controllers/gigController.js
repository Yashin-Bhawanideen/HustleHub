// The Gig model represents the gigs collection in the database.
const Gig = require('../models/Gig');

/**
 * Creates a new gig (freelancer action).
 * Expects name, title, description and amount in the request body.
 * Responds with 201 on success.
 */
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
/**
 * Returns all gigs created by the logged-in freelancer, newest first.
 */
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
/**
 * Returns a single gig by its ID, but only if it belongs to the logged-in
 * freelancer. The ID comes from the route (e.g. /gigs/:id).
 */
async function getGig(req, res, next) {
  try {
    const gig = await Gig.findOne({
      _id: req.params.id,
      freelancer: req.user._id
    });

    // 404 Not Found: the same response is used whether the gig does not exist
    // or belongs to someone else, so the response does not reveal which gigs exist.
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
/**
 * Updates an existing gig owned by the logged-in freelancer.
 * Expects the gig ID in the URL and the new details in the request body.
 */
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
/**
 * Deletes a gig owned by the logged-in freelancer.
 * The gig ID comes from the route (e.g. /gigs/:id).
 */
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
// Export the controller functions so they can be used in the route definitions.
module.exports = {
  createGig,
  getMyGigs,
  getGig,
  updateGig,
  deleteGig
};

// Reference List
// Express Error handling. Available at: https://expressjs.com/en/guide/error-handling.html (Accessed: 12 October 2026).
// Mongoose Models. Available at: https://mongoosejs.com/docs/models.html (Accessed: 12 October 2026).
// OWASP Authorization Cheat Sheet. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html (Accessed: 12 October 2026).
