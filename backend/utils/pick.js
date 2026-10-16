// Copy only whitelisted keys (stops clients from writing arbitrary fields).
function pick(obj = {}, keys = []) {
    const out = {};
    for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
    return out;
}
function escapeRegex(str = '') {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
module.exports = { pick, escapeRegex };
