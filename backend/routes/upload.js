const express = require('express');
const multer = require('multer');
const { isConfigured, uploadBuffer } = require('../config/cloudinary');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const MB = 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * MB } });

function kindOf(mimetype = '') {
    if (mimetype.startsWith('image/')) return { kind: 'image', max: 10 * MB, resourceType: 'image' };
    if (mimetype === 'application/pdf') return { kind: 'pdf', max: 10 * MB, resourceType: 'image' };
    if (['video/mp4', 'video/webm', 'video/quicktime'].includes(mimetype)) return { kind: 'video', max: 100 * MB, resourceType: 'video' };
    return null;
}

const FOLDERS = ['banners', 'reels', 'notices', 'certificates', 'teachers', 'courses', 'reviews', 'branding', 'general'];

// POST /api/upload?folder=banners   (multipart, field "file")  ->  { url, kind, bytes }
router.post('/', requireAdmin, (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            const big = err.code === 'LIMIT_FILE_SIZE';
            return res.status(400).json({ error: big ? 'File is too large (max 100 MB)' : 'Upload error' });
        }
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        if (!isConfigured) {
            return res.status(500).json({ error: 'Uploads need Cloudinary. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.' });
        }

        const info = kindOf(req.file.mimetype);
        if (!info) return res.status(400).json({ error: 'Only images, PDF and MP4/WebM/MOV video are allowed' });
        if (req.file.size > info.max) return res.status(400).json({ error: `${info.kind} is too large (max ${info.max / MB} MB)` });

        const folder = FOLDERS.includes(req.query.folder) ? req.query.folder : 'general';
        try {
            const result = await uploadBuffer(req.file.buffer, {
                folder: `smart-computer-education/${folder}`,
                resourceType: info.resourceType,
            });
            res.json({ url: result.secure_url, kind: info.kind, bytes: result.bytes });
        } catch (e) {
            console.error('Cloudinary upload failed:', e.message);
            res.status(500).json({ error: 'Upload failed. Check the Cloudinary env variables.' });
        }
    });
});

module.exports = router;
