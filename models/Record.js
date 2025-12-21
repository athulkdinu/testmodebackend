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
        type: String 
    },
    category: {
        type: String, 
        required: true
    },
    size: {
        type: String
    },
    fileUrl: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);
