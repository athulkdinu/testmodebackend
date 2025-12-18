const express = require('express');
const router = express.Router();
const { getDoctorPatients } = require('../controllers/userController');
const { protect, doctor } = require('../middlewares/authMiddleware');

router.get('/', protect, doctor, getDoctorPatients);

module.exports = router;

