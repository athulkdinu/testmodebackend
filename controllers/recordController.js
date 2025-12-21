const Record = require('../models/Record');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');


const getRecords = async (req, res) => {
    try {
        const records = await Record.find({ userId: req.user.id });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addRecord = async (req, res) => {
    try {
        const { filename, date, category, notes } = req.body;
        const file = req.file;
        
        const recordData = {
            userId: req.user.id,
            filename: filename || (file ? file.originalname : 'Untitled'),
            date: date || new Date().toISOString().split('T')[0],
            category: category || 'general',
            notes: notes || ''
        };
        
        if (file) {
            recordData.fileUrl = `/uploads/${file.filename}`;
            recordData.size = file.size.toString();
        }
        
        const record = await Record.create(recordData);
        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const updateRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        if (record.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedRecord = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deleteRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        if (record.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        
        if (record.fileUrl) {
            const filePath = path.join(__dirname, '..', record.fileUrl);
            if (fsSync.existsSync(filePath)) {
                fsSync.unlinkSync(filePath);
            }
        }

        await record.deleteOne();
        res.json({ message: 'Record deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const downloadRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        if (record.userId.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'doctor') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!record.fileUrl) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = path.join(__dirname, '..', record.fileUrl);
        if (!fsSync.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, record.filename);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPatientRecords = async (req, res) => {
    try {
        const { patientId } = req.params;
        const records = await Record.find({ userId: patientId });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRecords, addRecord, updateRecord, deleteRecord, getPatientRecords, downloadRecord };
