const express = require('express');
const router = express.Router();
const { getRecords, addRecord, updateRecord, deleteRecord, getPatientRecords, downloadRecord } = require('../controllers/recordController');
const { protect, doctor } = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

router.route('/')
    .get(protect, getRecords)
    .post(protect, upload.single('file'), addRecord);

router.route('/patient/:patientId')
    .get(protect, doctor, getPatientRecords);

router.route('/:id')
    .put(protect, updateRecord)
    .delete(protect, deleteRecord);

router.route('/:id/download')
    .get(protect, downloadRecord);

module.exports = router;
