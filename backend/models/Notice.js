const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        type: { type: String, enum: ['notice', 'offer', 'scholarship'], default: 'notice' },
        attachmentUrl: { type: String, default: '' }, // image or PDF
        validTill: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
