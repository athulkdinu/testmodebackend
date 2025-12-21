const express = require('express');
const router = express.Router();
const { generateToken } = require('../controllers/agoraTokenController');

// Agora kke olla  tokens create cheyyum video callingine
router.get('/token', generateToken);
router.post('/token', generateToken);

module.exports = router;

