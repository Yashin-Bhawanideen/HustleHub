const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { registerRules, loginRules, handleValidation } = require('../middleware/validators');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);
router.get('/me', authenticate, me);

module.exports = router;
