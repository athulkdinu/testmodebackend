const express = require('express');
const router = express.Router();
const { getSystemAnalytics } = require('../controllers/analyticsController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, admin, getSystemAnalytics);

module.exports = router;

