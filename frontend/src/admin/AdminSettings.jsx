import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import { useSite } from '../context/SiteContext.jsx';
import MediaField from './MediaField.jsx';
import Loader from './Loader.jsx';

export default function AdminSettings() {
    const { reload } = useSite();
    const [data, setData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const [cur, setCur] = useState('');
    const [nw, setNw] = useState('');
    const [pwMsg, setPwMsg] = useState('');
    const [pwErr, setPwErr] = useState('');

    useEffect(() => {
        api.get('/settings').then((r) => {
            const s = r.data;
            const stats = [...(s.stats || [])];
            while (stats.length < 3) stats.push({ value: '', label: '' });
            setData({ ...s, stats });
        }).catch((e) => setError(errMsg(e, 'Could not load settings')));
    }, []);

    if (!data) return error ? <p className="error-msg">{error}</p> : <Loader label="Loading settings…" />;

    const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
    const setStat = (i, k, v) => setData((d) => ({ ...d, stats: d.stats.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }));
    const text = (k, label, props = {}) => (
        <div className={props.wide ? 'span-2' : ''}>
            <label>{label}</label>
            {props.area
                ? <textarea rows={3} value={data[k] || ''} onChange={(e) => set(k, e.target.value)} />
                : <input value={data[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder={props.ph} />}
        </div>
    );

    const save = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg(''); setError('');
        try {
            const { _id, __v, createdAt, updatedAt, key, ...payload } = data;
            await api.put('/settings', payload);
            await reload();
            setMsg('Saved. Your website is updated.');
        } catch (err) {
            setError(errMsg(err, 'Save failed'));
        } finally {
            setSaving(false);
        }
    };

    const changePw = async (e) => {
        e.preventDefault();
        setPwMsg(''); setPwErr('');
        try {
            await api.post('/auth/change-password', { currentPassword: cur, newPassword: nw });
            setPwMsg('Password changed.'); setCur(''); setNw('');
        } catch (err) {
            setPwErr(errMsg(err, 'Could not change password'));
        }
    };

    return (
        <div>
            <h1 className="admin-title">Site Settings</h1>
            <p className="muted">Logo, name, colours and contact details used across the whole website.</p>

            <form className="admin-form" onSubmit={save}>
                <h3>Logo &amp; branding</h3>
                <div className="grid-2">
                    <div className="span-2">
                        <label>Website logo (header, admin &amp; login)</label>
                        <MediaField value={data.logoUrl} onChange={(v) => set('logoUrl', v)} folder="branding" hint="PNG with transparent background works best. Height around 120 px." />
                    </div>
                    <div className="span-2">
                        <label>Footer logo (optional — logo is used if empty)</label>
                        <MediaField value={data.footerLogoUrl} onChange={(v) => set('footerLogoUrl', v)} folder="branding" hint="The footer is dark, so a white/light version looks best." />
                    </div>
                    <div>
                        <label>Favicon / tab icon (optional)</label>
                        <MediaField value={data.faviconUrl} onChange={(v) => set('faviconUrl', v)} folder="branding" />
                    </div>
                    <div>
                        <label>Brand colour</label>
                        <input type="color" value={data.brandColor || '#7a1f2b'} onChange={(e) => set('brandColor', e.target.value)} style={{ height: 44, padding: 2 }} />
                        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Buttons, footer and highlights follow this colour.</div>
                    </div>
                    {text('siteName', 'Full name (footer, certificates, browser tab)')}
                    {text('shortName', 'Short name (text logo, admin panel)')}
                    {text('tagline', 'Tagline')}
                </div>

                <h3 style={{ marginTop: 28 }}>Home page text</h3>
                <div className="grid-2">
                    {text('heroTitle', 'Main heading', { wide: true })}
                    {text('heroText', 'Short description', { wide: true, area: true })}
                    {text('reelsHeading', 'Reels section heading')}
                    <div />
                    {data.stats.map((s, i) => (
                        <div key={i} className="span-2" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                            <div><label>Number / word #{i + 1}</label><input value={s.value || ''} onChange={(e) => setStat(i, 'value', e.target.value)} placeholder="1,000+" /></div>
                            <div><label>Label #{i + 1}</label><input value={s.label || ''} onChange={(e) => setStat(i, 'label', e.target.value)} placeholder="Certificates issued" /></div>
                        </div>
                    ))}
                </div>

                <h3 style={{ marginTop: 28 }}>Contact &amp; footer</h3>
                <div className="grid-2">
                    {text('aboutText', 'Footer description', { wide: true, area: true })}
                    {text('phone', 'Phone', { ph: '+91 98765 43210' })}
                    {text('whatsapp', 'WhatsApp number (digits, with country code)', { ph: '919876543210' })}
                    {text('email', 'Email')}
                    {text('address', 'Address', { area: true })}
                    {text('instagram', 'Instagram link')}
                    {text('facebook', 'Facebook link')}
                    {text('youtube', 'YouTube link')}
                </div>

                {error && <p className="error-msg">{error}</p>}
                {msg && <p style={{ color: '#16a34a' }}>{msg}</p>}
                <div className="form-actions"><button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button></div>
            </form>

            <form className="admin-form" onSubmit={changePw}>
                <h3>Change admin password</h3>
                <div className="grid-2">
                    <div><label>Current password</label><input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required autoComplete="current-password" /></div>
                    <div><label>New password (min 6 characters)</label><input type="password" value={nw} onChange={(e) => setNw(e.target.value)} required minLength={6} autoComplete="new-password" /></div>
                </div>
                {pwErr && <p className="error-msg">{pwErr}</p>}
                {pwMsg && <p style={{ color: '#16a34a' }}>{pwMsg}</p>}
                <div className="form-actions"><button className="btn-primary">Change password</button></div>
            </form>
        </div>
    );
}
