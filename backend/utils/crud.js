const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { pick } = require('./pick');

/**
 * Builds a standard CRUD router so every admin-managed section behaves the same:
 *   GET    /        public  -> only visible items (activeField !== false)
 *   GET    /all     admin   -> everything
 *   POST   /        admin   -> create
 *   PUT    /:id     admin   -> update   (PATCH works too)
 *   DELETE /:id     admin   -> delete
 *
 * Visible = `{ [activeField]: { $ne: false } }` so old documents that never had
 * the flag are still shown.
 */
function crud(Model, opts = {}) {
    const {
        fields,
        activeField = 'isActive',
        sort = { order: 1, createdAt: -1 },
        publicList = true,
        publicFilter,           // (req) => extra mongo filter for public GET /
        clean,                  // (data) => data  (normalise before save)
        cleanUpdate,            // (data) => data  (extra step on update only)
        label = 'item',
    } = opts;

    const router = express.Router();
    const fail = (res, e, code = 400) => res.status(code).json({ error: e.message || 'Request failed' });

    const listHandler = (all) => async (req, res) => {
        try {
            const filter = all ? {} : { [activeField]: { $ne: false }, ...(publicFilter ? publicFilter(req) : {}) };
            res.json(await Model.find(filter).sort(sort).lean());
        } catch (e) { fail(res, e, 500); }
    };

    if (publicList) router.get('/', listHandler(false));
    router.get('/all', requireAdmin, listHandler(true));
    if (!publicList) router.get('/', requireAdmin, listHandler(true));

    router.post('/', requireAdmin, async (req, res) => {
        try {
            let data = pick(req.body, fields);
            if (clean) data = clean(data);
            res.status(201).json(await Model.create(data));
        } catch (e) { fail(res, e); }
    });

    const update = async (req, res) => {
        try {
            let data = pick(req.body, fields);
            const clearing = { ...data };
            if (clean) data = clean(data);
            if (cleanUpdate) data = cleanUpdate(data, clearing);
            const doc = await Model.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
            if (!doc) return res.status(404).json({ error: `${label} not found` });
            res.json(doc);
        } catch (e) { fail(res, e); }
    };
    router.put('/:id', requireAdmin, update);
    router.patch('/:id', requireAdmin, update);

    router.delete('/:id', requireAdmin, async (req, res) => {
        try {
            const doc = await Model.findByIdAndDelete(req.params.id);
            if (!doc) return res.status(404).json({ error: `${label} not found` });
            res.json({ ok: true });
        } catch (e) { fail(res, e); }
    });

    return router;
}

module.exports = crud;
