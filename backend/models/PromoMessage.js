const mongoose = require('mongoose');

// The scrolling strip above the navbar ("Admissions open - 20% scholarship ...")
const PromoMessageSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.PromoMessage || mongoose.model('PromoMessage', PromoMessageSchema);
