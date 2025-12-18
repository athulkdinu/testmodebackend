const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    dosage: {
        type: String, // e.g., "10mg"
        required: true
    },
    time: {
        type: String // e.g., "08:00 AM"
    },
    frequency: {
        type: String, // e.g., "daily", "twice-daily"
        required: true
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
