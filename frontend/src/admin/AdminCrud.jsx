import { useEffect, useState } from 'react';
import api, { errMsg, isDirectVideo, youTubeId } from '../api.js';
import MediaField from './MediaField.jsx';
import Loader from './Loader.jsx';

const initialOf = (cfg) =>
    Object.fromEntries(cfg.fields.map((f) => [f.key, f.default !== undefined ? f.default : f.type === 'checkbox' ? true : f.type === 'number' ? 0 : '']));

const toForm = (cfg, item) => {
    const base = initialOf(cfg);
    for (const f of cfg.fields) {
        let v = item[f.key];
        if (v === undefined || v === null) v = base[f.key];
        if (f.type === 'date' && v) v = String(v).slice(0, 10);
        base[f.key] = v;
    }
    return base;
};

function Thumb({ url }) {
    if (!url) return null;
    const yt = youTubeId(url);
    if (isDirectVideo(url)) return <video src={url} muted loop playsInline preload="metadata" className="crud-thumb" />;
    if (yt) return <img src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`} alt="" className="crud-thumb" />;
    return <img src={url} alt="" className="crud-thumb" />;
}

/**
 * One reusable admin screen: list + add/edit form + delete.
 * Everything section-specific lives in the `cfg` object (see AdminModules.jsx).
 */
export default function AdminCrud({ cfg }) {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(() => initialOf(cfg));
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const activeKey = cfg.activeKey || 'isActive';

    const load = () => {
        setFetching(true);
        return api.get(`${cfg.path}/all`)
            .then((r) => setItems(r.data))
            .catch((e) => setError(errMsg(e, 'Could not load')))
            .finally(() => setFetching(false));
    };
    useEffect(() => { setEditing(null); setForm(initialOf(cfg)); load(); /* eslint-disable-next-line */ }, [cfg.path]);

    const startNew = () => { setEditing('new'); setForm(initialOf(cfg)); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const startEdit = (it) => { setEditing(it._id); setForm(toForm(cfg, it)); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const cancel = () => { setEditing(null); setForm(initialOf(cfg)); setError(''); };
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const save = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            if (editing === 'new') await api.post(cfg.path, form);
            else await api.put(`${cfg.path}/${editing}`, form);
            await load();
            cancel();
        } catch (err) {
            setError(errMsg(err, 'Save failed'));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (it) => {
        if (!window.confirm(`Delete this ${cfg.singular.toLowerCase()}?`)) return;
        try { await api.delete(`${cfg.path}/${it._id}`); load(); } catch (err) { alert(errMsg(err, 'Delete failed')); }
    };

    const toggle = async (it) => {
        try { await api.put(`${cfg.path}/${it._id}`, { [activeKey]: it[activeKey] === false }); load(); } catch (err) { alert(errMsg(err)); }
    };

    const atLimit = cfg.max && items.length >= cfg.max;

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">
                    {cfg.title}
                    {cfg.max && <small className="muted" style={{ fontSize: 14, fontWeight: 400, marginLeft: 10 }}>{items.length} / {cfg.max}</small>}
                </h1>
                <button className="btn-primary" onClick={startNew} disabled={atLimit}>+ Add {cfg.singular}</button>
            </div>
            {cfg.help && <p className="muted" style={{ marginTop: -6 }}>{cfg.help}</p>}

            {editing && (
                <form className="admin-form" onSubmit={save}>
                    <h3>{editing === 'new' ? `New ${cfg.singular}` : `Edit ${cfg.singular}`}</h3>
                    <div className="grid-2">
                        {cfg.fields.map((f) => {
                            if (f.type === 'checkbox') {
                                return (
                                    <label className="check" key={f.key}>
                                        <input type="checkbox" checked={!!form[f.key]} onChange={(e) => set(f.key, e.target.checked)} /> {f.label}
                                    </label>
                                );
                            }
                            return (
                                <div key={f.key} className={f.wide ? 'span-2' : ''}>
                                    <label>{f.label}{f.required && ' *'}</label>
                                    {f.type === 'textarea' ? (
                                        <textarea rows={f.rows || 4} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} required={f.required} />
                                    ) : f.type === 'select' ? (
                                        <select value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                                            {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                        </select>
                                    ) : f.type === 'media' ? (
                                        <MediaField value={form[f.key]} onChange={(v) => set(f.key, v)} accept={f.accept} folder={f.folder} allowLink={f.allowLink !== false} hint={f.hint} />
                                    ) : (
                                        <input
                                            type={f.type || 'text'}
                                            value={form[f.key]}
                                            min={f.min} max={f.max}
                                            required={f.required}
                                            placeholder={f.placeholder}
                                            onChange={(e) => set(f.key, f.type === 'number' ? (e.target.value === '' ? '' : +e.target.value) : e.target.value)}
                                        />
                                    )}
                                    {f.hint && f.type !== 'media' && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{f.hint}</div>}
                                </div>
                            );
                        })}
                    </div>
                    {error && <p className="error-msg">{error}</p>}
                    <div className="form-actions">
                        <button type="button" onClick={cancel}>Cancel</button>
                        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                    </div>
                </form>
            )}

            {!editing && error && <p className="error-msg">{error}</p>}

            <div className="banner-list">
                {fetching ? <Loader label={`Loading ${cfg.title.toLowerCase()}…`} /> : (
                    <>
                        {items.map((it) => {
                            const v = cfg.view(it);
                            const on = it[activeKey] !== false;
                            return (
                                <div className="banner-card" key={it._id} style={on ? undefined : { opacity: 0.6 }}>
                                    {v.thumb && cfg.bigThumb !== false && <Thumb url={v.thumb} />}
                                    <div className="banner-meta">
                                        <div style={{ minWidth: 0 }}>
                                            <strong>{v.title || '(untitled)'}</strong>
                                            {(v.lines || []).filter(Boolean).map((l, i) => <div key={i} className="muted" style={{ fontSize: 13, marginTop: 2 }}>{l}</div>)}
                                            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{on ? '● Visible on website' : '○ Hidden'}</div>
                                        </div>
                                        <div className="form-actions" style={{ marginTop: 0 }}>
                                            <button onClick={() => toggle(it)}>{on ? 'Hide' : 'Show'}</button>
                                            <button onClick={() => startEdit(it)}>Edit</button>
                                            <button className="btn-danger" onClick={() => remove(it)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {items.length === 0 && <p className="muted">Nothing here yet. Click “Add {cfg.singular}”.</p>}
                    </>
                )}
            </div>
        </div>
    );
}
