const mongoose = require('mongoose');

// One document (key: "site") holding everything the admin can change globally.
const SiteSettingSchema = new mongoose.Schema(
    {
        key: { type: String, default: 'site', unique: true },
        siteName: { type: String, default: 'Smart Computer Education Society' },
        shortName: { type: String, default: 'Smart Computers' },
        tagline: { type: String, default: 'Computer Education & Placement' },
        logoUrl: { type: String, default: '' },
        footerLogoUrl: { type: String, default: '' },
        faviconUrl: { type: String, default: '' },
        brandColor: { type: String, default: '#7a1f2b' },

        // Home page intro (shown when there is no hero banner, and as the intro block below it)
        heroTitle: { type: String, default: 'Turn your skills into a career-ready certificate.' },
        heroText: {
            type: String,
            default:
                'Industry-ready computer courses, backed by certificates with a roll number and QR code that anyone can verify instantly.',
        },
        stats: {
            type: [{ value: String, label: String }],
            default: [
                { value: '1,000+', label: 'Certificates issued' },
                { value: '100%', label: 'Roll No. & QR verifiable' },
                { value: 'Placement', label: 'Assistance included' },
            ],
        },

        aboutText: { type: String, default: 'Practical, instructor-led computer education with verifiable certificates.' },
        phone: { type: String, default: '' },
        whatsapp: { type: String, default: '' }, // digits with country code, e.g. 919876543210
        email: { type: String, default: '' },
        address: { type: String, default: '' },
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        youtube: { type: String, default: '' },
        reelsHeading: { type: String, default: 'LIFE AT OUR INSTITUTE' },
    },
    { timestamps: true }
);

module.exports = mongoose.models.SiteSetting || mongoose.model('SiteSetting', SiteSettingSchema);
