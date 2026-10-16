const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        duration: { type: String, default: '' },
        fee: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);
