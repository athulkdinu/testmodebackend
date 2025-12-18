const express = require('express');
const router = express.Router();
const { getMedicines, addMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getMedicines)
    .post(protect, addMedicine);

router.route('/:id')
    .put(protect, updateMedicine)
    .delete(protect, deleteMedicine);

module.exports = router;
