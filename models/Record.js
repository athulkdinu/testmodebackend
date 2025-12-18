const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    date: {
        type: String // YYYY-MM-DD
    },
    category: {
        type: String, // e.g., "lab-report", "imaging"
        required: true
    },
    size: {
        type: String
    },
    fileUrl: {
        type: String // Path to file or URL
    }
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);
