const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        designation: { type: String, default: '' },
        experience: { type: String, default: '' },
        bio: { type: String, default: '' },
        photoUrl: { type: String, default: '' },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
