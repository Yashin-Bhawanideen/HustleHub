const express = require('express');

const Gig = require('../models/Gig');

const {
    authenticate,
    authorizeRoles
} = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('client'));

router.get('/gigs', async (req, res, next) => {
    try {
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

module.exports = router;