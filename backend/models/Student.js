const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        rollNumber: { type: String, default: '', index: true },
        course: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        address: { type: String, default: '' },
        joiningDate: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);
