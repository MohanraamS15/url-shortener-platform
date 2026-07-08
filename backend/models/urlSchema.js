const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'Please provide the long URL'],
    },
    shortCode: {
        type: String,
        required: [true, 'Please provide the short code'],
        unique: true
    },
    accessCount: {
        type: Number,
        default: 0
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Url', urlSchema);
