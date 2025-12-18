const express = require('express');
const router = express.Router();
const { getAllUsers, addUser, deleteUser, getDoctorPatients } = require('../controllers/userController');
const { protect, admin, doctor } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, admin, getAllUsers)
    .post(protect, admin, addUser);

router.route('/:id')
    .delete(protect, admin, deleteUser);

module.exports = router;
