const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        course: { type: String, default: '' },
        rating: { type: Number, default: 5, min: 1, max: 5 },
        text: { type: String, required: true },
        photoUrl: { type: String, default: '' },
        date: { type: String, default: '' }, // free text, e.g. "20 NOV, 2025"
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
