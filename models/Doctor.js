const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        default: 0
    },
    contact: {
        type: String
    },
    schedule: [{
        day: String,
        slots: [String] // e.g., ["09:00 AM", "10:00 AM"]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
