const mongoose = require('mongoose');

const healthInsightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['bmi', 'blood_pressure', 'weight', 'height'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    additionalData: {
        type: mongoose.Schema.Types.Mixed 
    },
    date: {
        type: String, 
        required: true
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('HealthInsight', healthInsightSchema);

