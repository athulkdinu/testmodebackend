const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateDoctorProfile } = require('../controllers/profileController');
const { protect, doctor } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.put('/doctor', protect, doctor, updateDoctorProfile);

module.exports = router;

