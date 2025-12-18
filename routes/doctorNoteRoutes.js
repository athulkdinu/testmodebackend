const express = require('express');
const router = express.Router();
const { getDoctorNotes, addDoctorNote, updateDoctorNote, getPatientNotes } = require('../controllers/doctorNoteController');
const { protect, doctor } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getDoctorNotes)
    .post(protect, doctor, addDoctorNote);

router.route('/patient/:patientId')
    .get(protect, doctor, getPatientNotes);

router.route('/:id')
    .put(protect, doctor, updateDoctorNote);

module.exports = router;
