const express = require('express');
const router = express.Router();
const { generateToken } = require('../controllers/agoraTokenController');

// Generate Agora token for video calling
router.get('/token', generateToken);
router.post('/token', generateToken);

module.exports = router;

