const express = require('express');

const {
  createGig,
  getMyGigs,
  getGig,
  updateGig,
  deleteGig
} = require('../controllers/gigController');

const {
  authenticate,
  authorizeRoles
} = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('freelancer'));

router.post('/', createGig);

router.get('/my', getMyGigs);

router.get('/:id', getGig);

router.put('/:id', updateGig);

router.delete('/:id', deleteGig);

module.exports = router;