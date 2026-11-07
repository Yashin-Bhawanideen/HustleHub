const express = require('express');
const {getSummary } = require('../controllers/taxController');
const {authenticate} = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('freelancer'));
router.get('/summary', getSummary);

module.exports = router;