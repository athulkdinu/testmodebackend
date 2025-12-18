const mongoose = require('mongoose');

const doctorNoteSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    note: {
        type: String,
        required: true
    },
    diagnosis: {
        type: String
    },
    prescription: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('DoctorNote', doctorNoteSchema);
