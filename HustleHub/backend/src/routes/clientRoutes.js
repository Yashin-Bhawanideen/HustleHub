// Express is the web framework used to build the REST API
const express = require('express');

const Gig = require('../models/Gig');

// authenticate checks the JWT and attaches the user to req.user, while
// authorizeRoles restricts a route to specific user roles.
const {
    authenticate,
    authorizeRoles
} = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('client'));

// GET /api/client/gigs
// Lets a client browse all gigs from all freelancers so they can choose one
// to book. The route is defined inline with an async handler instead of a
// separate controller.
router.get('/gigs', async (req, res, next) => {
    try {
        // Find every gig (no ownership filter, unlike getMyGigs).
        // populate() replaces the freelancer's ID with their name only, so
        // other details such as their email are not exposed to clients
        const gigs = await Gig.find()
            .populate('freelancer', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            gigs
        });
    } catch (err) {
        next(err);
    }
});
// Export the router so it can be mounted in app.js.
module.exports = router;

// Reference List
// Express Express - Node.js web application framework. Available at: https://expressjs.com/ (Accessed: 12 October 2026).
// Express Routing. Available at: https://expressjs.com/en/guide/routing.html (Accessed: 12 October 2026).
