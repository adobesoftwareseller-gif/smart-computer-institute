const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
    {
        certificateId: { type: String, required: true, unique: true, trim: true },
        rollNumber: { type: String, required: true, trim: true, index: true },
        studentName: { type: String, required: true, trim: true },
        courseName: { type: String, required: true, trim: true },
        issueDate: { type: Date, required: true },
        grade: { type: String, default: '' },
        duration: { type: String, default: '' },
        certificateFileUrl: { type: String, default: '' }, // uploaded scan/PDF of the certificate
        verificationUrl: { type: String, default: '' },
        qrCodeUrl: { type: String, default: '' },          // data-URL PNG
        isValid: { type: Boolean, default: true },          // false = revoked
        importedInBulk: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
