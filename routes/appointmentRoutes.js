const express = require('express');
const router = express.Router();
const { getAppointments, bookAppointment, updateAppointment, approveAppointment, rejectAppointment } = require('../controllers/appointmentController');
const { protect, doctor } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getAppointments)
    .post(protect, bookAppointment);

router.route('/:id')
    .put(protect, updateAppointment);

router.route('/:id/approve')
    .put(protect, doctor, approveAppointment);

router.route('/:id/reject')
    .put(protect, doctor, rejectAppointment);

module.exports = router;
