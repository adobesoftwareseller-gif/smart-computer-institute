const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema(
    {
        title: { type: String, default: '' },
        videoUrl: { type: String, required: true }, // uploaded video (Cloudinary) or a YouTube link
        thumbnailUrl: { type: String, default: '' },
        category: { type: String, default: '' },
        label: { type: String, default: '' },       // button text in the popup, e.g. "Enquire Now"
        link: { type: String, default: '' },        // where the button goes
        order: { type: Number, default: 0 },
        isPublished: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Reel || mongoose.model('Reel', ReelSchema);
