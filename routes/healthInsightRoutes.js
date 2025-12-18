const express = require('express');
const router = express.Router();
const { getHealthInsights, addHealthInsight, getBMITracker, getBloodPressureTrends, getAppointmentStats } = require('../controllers/healthInsightController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getHealthInsights)
    .post(protect, addHealthInsight);

router.get('/bmi', protect, getBMITracker);
router.get('/blood-pressure', protect, getBloodPressureTrends);
router.get('/appointment-stats', protect, getAppointmentStats);

module.exports = router;

