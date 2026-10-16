const express = require('express');
const QRCode = require('qrcode');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Certificate = require('../models/Certificate');
const SiteSetting = require('../models/SiteSetting');
const { requireAdmin } = require('../middleware/auth');
const { pick, escapeRegex } = require('../utils/pick');

const router = express.Router();
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const CERT_FIELDS = [
    'certificateId', 'rollNumber', 'studentName', 'courseName', 'issueDate',
    'grade', 'duration', 'certificateFileUrl', 'isValid',
];
const CERT_EDIT_FIELDS = CERT_FIELDS.filter((f) => f !== 'certificateId');

function verifyBase() {
    if (process.env.PUBLIC_VERIFY_BASE_URL) return process.env.PUBLIC_VERIFY_BASE_URL;
    const first = String(process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    return `${first.replace(/\/+$/, '')}/verify-certificate`;
}
const verifyUrlFor = (id) => `${verifyBase()}?id=${encodeURIComponent(id)}`;
const newCertId = () => `SCES-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

// ---------- Public: verify ----------
// GET /api/certificates/verify?rollNumber=XXX   or   ?id=CERTIFICATE_ID
router.get('/verify', async (req, res) => {
    try {
        const { rollNumber, id } = req.query;
        if (!rollNumber && !id) return res.status(400).json({ valid: false, error: 'Provide rollNumber or certificate id' });

        const query = id
            ? { certificateId: String(id) }
            : { rollNumber: new RegExp(`^${escapeRegex(String(rollNumber).trim())}$`, 'i') };
        const c = await Certificate.findOne(query);

        if (!c || c.isValid === false) return res.status(404).json({ valid: false, message: 'Certificate not found' });

        res.json({
            valid: true,
            certificate: {
                _id: c._id,
                certificateId: c.certificateId,
                studentName: c.studentName,
                rollNumber: c.rollNumber,
                courseName: c.courseName,
                issueDate: c.issueDate,
                grade: c.grade,
                duration: c.duration,
                certificateFileUrl: c.certificateFileUrl || '',
            },
        });
    } catch (e) {
        res.status(500).json({ valid: false, error: 'Verification failed' });
    }
});

// ---------- Public: generated PDF ----------
// GET /api/certificates/:id/pdf
router.get('/:id/pdf', async (req, res) => {
    try {
        const c = await Certificate.findById(req.params.id);
        if (!c || c.isValid === false) return res.status(404).send('Certificate not found');
        const site = await SiteSetting.findOne({ key: 'site' }).lean();
        const orgName = (site && site.siteName) || 'Smart Computer Education Society';

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([842, 595]);
        const { width, height } = page.getSize();
        const serif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const dark = rgb(0.48, 0.12, 0.17);
        const gold = rgb(0.72, 0.54, 0.2);

        page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: dark, borderWidth: 3 });
        page.drawRectangle({ x: 30, y: 30, width: width - 60, height: height - 60, borderColor: gold, borderWidth: 1 });

        // pdf-lib's built-in fonts only support Latin characters
        const safe = (t) => String(t ?? '').replace(/[^\x20-\x7E]/g, '?');
        const center = (text, y, font, size, color = rgb(0.12, 0.08, 0.07)) => {
            const t = safe(text);
            page.drawText(t, { x: (width - font.widthOfTextAtSize(t, size)) / 2, y, size, font, color });
        };

        center(orgName, height - 90, serif, 22, dark);
        center('Certificate of Completion', height - 125, regular, 14, gold);
        center('This is to certify that', height - 190, regular, 13);
        center(c.studentName, height - 225, serif, 26, dark);
        center(`has successfully completed the course "${c.courseName}"`, height - 265, regular, 13);
        if (c.duration) center(`Duration: ${c.duration}`, height - 290, regular, 12);
        center(`Roll Number: ${c.rollNumber}   |   Certificate ID: ${c.certificateId}`, height - 330, regular, 11);
        center(
            `Issue Date: ${new Date(c.issueDate).toLocaleDateString('en-GB')}${c.grade ? '   |   Grade: ' + c.grade : ''}`,
            height - 350, regular, 11
        );
        center(`Verify this certificate at: ${c.verificationUrl || verifyUrlFor(c.certificateId)}`, 70, regular, 9, rgb(0.4, 0.35, 0.32));

        const bytes = await pdfDoc.save();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${String(c.certificateId).replace(/[^\w.-]/g, '_')}.pdf"`,
        });
        res.send(Buffer.from(bytes));
    } catch (e) {
        console.error(e);
        res.status(500).send('Could not generate PDF');
    }
});

// ---------- Admin ----------
router.get('/', requireAdmin, async (req, res) => {
    try {
        const search = escapeRegex(req.query.search || '');
        const query = search
            ? { $or: [{ rollNumber: new RegExp(search, 'i') }, { studentName: new RegExp(search, 'i') }, { certificateId: new RegExp(search, 'i') }] }
            : {};
        const certificates = await Certificate.find(query).sort({ createdAt: -1 }).limit(300);
        res.json({ certificates });
    } catch (e) {
        res.status(500).json({ error: 'Failed to load certificates' });
    }
});

router.post('/', requireAdmin, async (req, res) => {
    try {
        const data = pick(req.body, CERT_FIELDS);
        if (!data.certificateId || !String(data.certificateId).trim()) data.certificateId = newCertId();
        data.certificateId = String(data.certificateId).trim();
        const verificationUrl = verifyUrlFor(data.certificateId);
        const qrCodeUrl = await QRCode.toDataURL(verificationUrl);
        const certificate = await Certificate.create({ ...data, verificationUrl, qrCodeUrl });
        res.status(201).json({ certificate });
    } catch (e) {
        const dup = e && e.code === 11000;
        res.status(dup ? 409 : 400).json({ error: dup ? 'This certificate ID already exists' : (e.message || 'Failed to create certificate') });
    }
});

router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(req.params.id, pick(req.body, CERT_EDIT_FIELDS), { new: true, runValidators: true });
        if (!certificate) return res.status(404).json({ error: 'Not found' });
        res.json({ certificate });
    } catch (e) {
        res.status(400).json({ error: 'Failed to update certificate' });
    }
});

router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const c = await Certificate.findByIdAndDelete(req.params.id);
        if (!c) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: 'Failed to delete certificate' });
    }
});

// Bulk CSV import. Columns: certificateId,rollNumber,studentName,courseName,issueDate,grade,duration
// (certificateId may be empty -> auto generated). Existing certificateIds are updated.
router.post('/import', requireAdmin, (req, res) => {
    csvUpload.single('file')(req, res, async (uploadErr) => {
        if (uploadErr) return res.status(400).json({ error: 'CSV upload failed (max 5 MB)' });
        if (!req.file) return res.status(400).json({ error: 'No CSV file provided' });
        try {
            const rows = [];
            await new Promise((resolve, reject) => {
                Readable.from(req.file.buffer)
                    .pipe(csv({ mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim() }))
                    .on('data', (r) => rows.push(r))
                    .on('end', resolve)
                    .on('error', reject);
            });
            if (!rows.length) return res.status(400).json({ error: 'CSV has no rows' });
            if (rows.length > 5000) return res.status(400).json({ error: 'Max 5000 rows per import' });

            let success = 0;
            const failed = [];
            for (const [i, row] of rows.entries()) {
                const id = (row.certificateId || '').trim() || newCertId();
                try {
                    const issueDate = new Date(row.issueDate);
                    if (!row.rollNumber || !row.studentName || !row.courseName || isNaN(issueDate)) {
                        throw new Error('Missing/invalid rollNumber, studentName, courseName or issueDate');
                    }
                    const verificationUrl = verifyUrlFor(id);
                    const qrCodeUrl = await QRCode.toDataURL(verificationUrl);
                    await Certificate.findOneAndUpdate(
                        { certificateId: id },
                        {
                            certificateId: id,
                            rollNumber: row.rollNumber.trim(),
                            studentName: row.studentName.trim(),
                            courseName: row.courseName.trim(),
                            issueDate,
                            grade: (row.grade || '').trim(),
                            duration: (row.duration || '').trim(),
                            qrCodeUrl,
                            verificationUrl,
                            isValid: true,
                            importedInBulk: true,
                        },
                        { upsert: true, new: true }
                    );
                    success++;
                } catch (e) {
                    failed.push({ row: i + 2, certificateId: id, error: e.message });
                }
            }
            res.json({ total: rows.length, success, failedCount: failed.length, failed: failed.slice(0, 20) });
        } catch (e) {
            res.status(400).json({ error: 'Could not read the CSV file' });
        }
    });
});

module.exports = router;
