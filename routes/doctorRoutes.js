const express = require('express');
const router = express.Router();
const { getAllDoctors, addDoctor, deleteDoctor, updateDoctor } = require('../controllers/doctorController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getAllDoctors) // Publicly accessible for booking
    .post(protect, admin, addDoctor);

router.route('/:id')
    .put(protect, admin, updateDoctor)
    .delete(protect, admin, deleteDoctor);

module.exports = router;
