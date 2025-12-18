const express = require('express');
const router = express.Router();
const { getPatientDashboard, getDoctorDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { protect, admin, doctor } = require('../middlewares/authMiddleware');

router.get('/patient', protect, getPatientDashboard);
router.get('/doctor', protect, doctor, getDoctorDashboard);
router.get('/admin', protect, admin, getAdminDashboard);

module.exports = router;

