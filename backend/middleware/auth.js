const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
    console.warn('[warn] JWT_SECRET is not set - using an insecure dev secret. Set it in your env!');
}
const SECRET = () => process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, SECRET(), { expiresIn });
}

function readToken(req) {
    const header = req.headers.authorization || '';
    return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Protects admin routes. Frontend sends: Authorization: Bearer <token>
function requireAdmin(req, res, next) {
    const token = readToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        req.admin = jwt.verify(token, SECRET());
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { signToken, requireAdmin };
