const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { signToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// --- tiny in-memory brute-force guard: 8 failed logins / 15 min / IP ---
const fails = new Map();
const WINDOW = 15 * 60 * 1000;
const MAX_FAILS = 8;
function tooMany(ip) {
    const r = fails.get(ip);
    if (!r) return false;
    if (Date.now() - r.first > WINDOW) { fails.delete(ip); return false; }
    return r.count >= MAX_FAILS;
}
function noteFail(ip) {
    const r = fails.get(ip);
    if (!r || Date.now() - r.first > WINDOW) fails.set(ip, { first: Date.now(), count: 1 });
    else r.count++;
}

async function passwordMatches(plain, stored = '') {
    if (/^\$2[aby]\$/.test(stored)) return bcrypt.compare(plain, stored);
    return plain === stored; // legacy plain-text value from an older setup
}

// POST /api/auth/login   { email (or username), password }
// Works with an admin stored in MongoDB, or - on first run - the ADMIN_EMAIL / ADMIN_PASSWORD env vars
// (that admin is then saved to MongoDB with a hashed password so it can be changed from the panel).
router.post('/login', async (req, res) => {
    try {
        const ip = req.ip || 'x';
        if (tooMany(ip)) return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });

        const ident = String(req.body.email || req.body.username || '').trim();
        const password = String(req.body.password || '');
        if (!ident || !password) return res.status(400).json({ error: 'Email and password are required' });

        let admin = await Admin.findOne({ $or: [{ email: ident.toLowerCase() }, { username: ident }] });

        if (!admin) {
            const envUser = String(process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || '').trim();
            const envPass = process.env.ADMIN_PASSWORD || '';
            if (envUser && envPass && ident.toLowerCase() === envUser.toLowerCase() && password === envPass) {
                admin = await Admin.create({
                    email: envUser.includes('@') ? envUser.toLowerCase() : undefined,
                    username: envUser.includes('@') ? undefined : envUser,
                    password: await bcrypt.hash(envPass, 10),
                    name: 'Admin',
                });
            }
        }

        if (!admin || !(await passwordMatches(password, admin.password))) {
            noteFail(ip);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        fails.delete(ip);
        const token = signToken({ adminId: admin._id.toString(), email: admin.email || admin.username });
        res.json({ token, admin: { _id: admin._id, email: admin.email || admin.username, name: admin.name || 'Admin' } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/me
router.get('/me', requireAdmin, async (req, res) => {
    const admin = await Admin.findById(req.admin.adminId).select('-password').lean();
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
});

// POST /api/auth/change-password   { currentPassword, newPassword }
router.post('/change-password', requireAdmin, async (req, res) => {
    try {
        const currentPassword = String(req.body.currentPassword || '');
        const newPassword = String(req.body.newPassword || '');
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords are required' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

        const admin = await Admin.findById(req.admin.adminId);
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        if (!(await passwordMatches(currentPassword, admin.password))) {
            return res.status(401).json({ error: 'Current password is wrong' });
        }
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        res.json({ message: 'Password changed' });
    } catch (e) {
        res.status(500).json({ error: 'Could not change password' });
    }
});

module.exports = router;
