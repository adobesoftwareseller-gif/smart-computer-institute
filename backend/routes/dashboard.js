const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const M = {
    banners: require('../models/Banner'),
    reels: require('../models/Reel'),
    notices: require('../models/Notice'),
    certificates: require('../models/Certificate'),
    courses: require('../models/Course'),
    teachers: require('../models/Teacher'),
    reviews: require('../models/Review'),
    students: require('../models/Student'),
};

const router = express.Router();

router.get('/counts', requireAdmin, async (_req, res) => {
    try {
        const keys = Object.keys(M);
        const values = await Promise.all(keys.map((k) => M[k].countDocuments()));
        res.json(Object.fromEntries(keys.map((k, i) => [k, values[i]])));
    } catch (e) {
        res.status(500).json({ error: 'Failed to load counts' });
    }
});

module.exports = router;
