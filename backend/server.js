const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (_) { /* some hosts forbid this - ignore */ }
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const crud = require('./utils/crud');
const Banner = require('./models/Banner');
const Reel = require('./models/Reel');
const Notice = require('./models/Notice');
const Course = require('./models/Course');
const Teacher = require('./models/Teacher');
const Review = require('./models/Review');
const Student = require('./models/Student');
const Faq = require('./models/Faq');
const PromoMessage = require('./models/PromoMessage');

process.on('unhandledRejection', (r) => console.error('Unhandled Promise Rejection:', r));
process.on('uncaughtException', (e) => console.error('Uncaught Exception:', e));

const app = express();
app.set('trust proxy', 1);

// ---- CORS ----
// FRONTEND_URL (or CLIENT_URL) = your Vercel URL(s), comma separated. Empty = allow all.
const allowed = String(process.env.FRONTEND_URL || process.env.CLIENT_URL || '')
    .split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);
app.use(cors({
    origin(origin, cb) {
        if (!origin || !allowed.length) return cb(null, true);
        const o = origin.replace(/\/+$/, '');
        if (allowed.includes(o) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) return cb(null, true);
        return cb(null, false);
    },
    credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Short browser/CDN cache for public GETs (admin "/all" lists and certificate lookups stay live)
const PUBLIC = ['/api/banners', '/api/reels', '/api/notices', '/api/courses', '/api/teachers', '/api/reviews', '/api/faqs', '/api/promo-messages', '/api/settings'];
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.endsWith('/all') && PUBLIC.some((p) => req.path === p)) {
        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    }
    next();
});

// ---- Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/auth')); // alias
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use('/api/banners', crud(Banner, {
    label: 'Banner',
    fields: ['title', 'subtitle', 'imageUrl', 'linkUrl', 'placement', 'order', 'isActive'],
    sort: { order: 1, createdAt: -1 },
    publicFilter: (req) => {
        if (req.query.placement === 'mid') return { placement: 'mid' };
        if (req.query.placement === 'hero') return { placement: { $ne: 'mid' } };
        return {};
    },
}));

app.use('/api/reels', crud(Reel, {
    label: 'Reel',
    activeField: 'isPublished',
    fields: ['title', 'videoUrl', 'thumbnailUrl', 'category', 'label', 'link', 'order', 'isPublished'],
    sort: { order: 1, createdAt: -1 },
}));

app.use('/api/notices', crud(Notice, {
    label: 'Notice',
    fields: ['title', 'description', 'type', 'attachmentUrl', 'validTill', 'isActive'],
    sort: { createdAt: -1 },
    clean: (d) => { if (d.validTill === '' || d.validTill === null) delete d.validTill; return d; },
    // empty date in the form on edit = remove the expiry date
    cleanUpdate: (d, raw) => {
        if (raw.validTill === '' || raw.validTill === null) d.$unset = { validTill: 1 };
        return d;
    },
}));

app.use('/api/courses', crud(Course, { label: 'Course', fields: ['title', 'description', 'duration', 'fee', 'imageUrl', 'order', 'isActive'] }));
app.use('/api/teachers', crud(Teacher, { label: 'Teacher', fields: ['name', 'designation', 'experience', 'bio', 'photoUrl', 'order', 'isActive'] }));
app.use('/api/reviews', crud(Review, { label: 'Review', fields: ['name', 'course', 'rating', 'text', 'photoUrl', 'date', 'order', 'isActive'] }));
app.use('/api/students', crud(Student, {
    label: 'Student', publicList: false, sort: { createdAt: -1 },
    fields: ['name', 'rollNumber', 'course', 'phone', 'email', 'address', 'joiningDate', 'isActive'],
    clean: (d) => { if (d.joiningDate === '') delete d.joiningDate; return d; },
}));
app.use('/api/faqs', crud(Faq, { label: 'FAQ', fields: ['question', 'answer', 'order', 'isActive'] }));
app.use('/api/promo-messages', crud(PromoMessage, { label: 'Message', fields: ['text', 'order', 'isActive'] }));

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'Smart Computer Education Society API' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState === 1 }));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
});

// ---- Database ----
const MONGO_URI =
    process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || process.env.DATABASE_URL || '';

let dbPromise = null;
function connectDB() {
    if (mongoose.connection.readyState === 1) return Promise.resolve();
    if (!MONGO_URI) return Promise.reject(new Error('No MongoDB URL found. Set MONGODB_URI (or MONGO_URI) in the environment.'));
    if (!dbPromise) {
        dbPromise = mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 20000,
            maxPoolSize: 5,
        }).catch((err) => { dbPromise = null; console.error('DB Connection Error:', err.message); throw err; });
    }
    return dbPromise;
}

function connectWithRetry(delay = 5000) {
    connectDB()
        .then(() => console.log('MongoDB connected successfully'))
        .catch(() => {
            console.error(`Retrying MongoDB connection in ${delay / 1000}s...`);
            setTimeout(() => connectWithRetry(Math.min(delay * 2, 60000)), delay);
        });
}
mongoose.connection.on('disconnected', () => { dbPromise = null; });

function bootstrap() { return connectDB(); } // used by api/index.js on Vercel

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
    connectWithRetry();
}

module.exports = { app, bootstrap };
