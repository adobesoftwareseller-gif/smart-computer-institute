const express = require('express');
const SiteSetting = require('../models/SiteSetting');
const { requireAdmin } = require('../middleware/auth');
const { pick } = require('../utils/pick');

const router = express.Router();

const FIELDS = [
    'siteName', 'shortName', 'tagline', 'logoUrl', 'footerLogoUrl', 'faviconUrl', 'brandColor',
    'heroTitle', 'heroText', 'stats', 'aboutText', 'phone', 'whatsapp', 'email', 'address',
    'instagram', 'facebook', 'youtube', 'reelsHeading',
];

async function getSettings() {
    let s = await SiteSetting.findOne({ key: 'site' });
    if (!s) s = await SiteSetting.create({ key: 'site' });
    return s;
}

// Public: the site reads logo, name, contact details and colours from here.
router.get('/', async (_req, res) => {
    try { res.json(await getSettings()); } catch (e) { res.status(500).json({ error: 'Failed to load settings' }); }
});

router.put('/', requireAdmin, async (req, res) => {
    try {
        const s = await getSettings();
        const data = pick(req.body, FIELDS);
        if (data.brandColor && !/^#[0-9a-fA-F]{6}$/.test(data.brandColor)) delete data.brandColor;
        if (Array.isArray(data.stats)) data.stats = data.stats.filter((x) => x && (x.value || x.label)).slice(0, 4);
        Object.assign(s, data);
        await s.save();
        res.json(s);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;
