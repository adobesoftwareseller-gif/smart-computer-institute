const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
    {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        imageUrl: { type: String, required: true },
        linkUrl: { type: String, default: '' },
        placement: { type: String, enum: ['hero', 'mid'], default: 'hero' }, // hero = top slider, mid = wide banner mid-page
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
