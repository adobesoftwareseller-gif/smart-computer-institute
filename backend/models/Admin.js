const mongoose = require('mongoose');

// strict:false so an existing "admins" collection with extra fields keeps working.
const AdminSchema = new mongoose.Schema(
    {
        email: { type: String, lowercase: true, trim: true, index: true },
        username: { type: String, trim: true },
        password: { type: String, required: true }, // bcrypt hash (plain text from older setups is still accepted on login)
        name: { type: String, default: 'Admin' },
    },
    { timestamps: true, strict: false }
);

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
