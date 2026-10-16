import { useEffect, useState } from 'react';
import api, { API_URL, errMsg } from '../api.js';
import MediaField from './MediaField.jsx';

const EMPTY = { certificateId: '', rollNumber: '', studentName: '', courseName: '', issueDate: '', grade: '', duration: '', certificateFileUrl: '' };

export default function AdminCertificates() {
    const [list, setList] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [lastQr, setLastQr] = useState(null);
    const [csv, setCsv] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importRes, setImportRes] = useState(null);

    const load = (q = '') =>
        api.get(`/certificates${q ? `?search=${encodeURIComponent(q)}` : ''}`)
            .then((r) => setList(r.data.certificates || []))
            .catch((e) => setError(errMsg(e, 'Could not load certificates')));
    useEffect(() => { load(); }, []);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const reset = () => { setForm(EMPTY); setEditingId(null); };

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(''); setMsg('');
        try {
            if (editingId) {
                await api.patch(`/certificates/${editingId}`, form);
                setMsg('Certificate updated.');
            } else {
                const { data } = await api.post('/certificates', form);
                setLastQr(data.certificate.qrCodeUrl);
                setMsg('Certificate added and QR code generated.');
            }
            reset();
            load(search);
        } catch (err) {
            setError(errMsg(err, 'Could not save certificate'));
        } finally {
            setSaving(false);
        }
    };

    const edit = (c) => {
        setEditingId(c._id);
        setForm({
            certificateId: c.certificateId, rollNumber: c.rollNumber, studentName: c.studentName, courseName: c.courseName,
            issueDate: c.issueDate ? String(c.issueDate).slice(0, 10) : '', grade: c.grade || '', duration: c.duration || '',
            certificateFileUrl: c.certificateFileUrl || '',
        });
        setMsg(''); setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleValid = async (c) => {
        await api.patch(`/certificates/${c._id}`, { isValid: c.isValid === false });
        load(search);
    };
    const remove = async (c) => {
        if (!window.confirm(`Delete certificate ${c.certificateId}?`)) return;
        await api.delete(`/certificates/${c._id}`);
        load(search);
    };

    const doImport = async () => {
        if (!csv) return;
        setImporting(true); setImportRes(null); setError('');
        try {
            const fd = new FormData();
            fd.append('file', csv);
            const { data } = await api.post('/certificates/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setImportRes(data);
            setCsv(null);
            load(search);
        } catch (err) {
            setError(errMsg(err, 'Import failed'));
        } finally {
            setImporting(false);
        }
    };

    return (
        <div>
            <h1 className="admin-title">Certificates</h1>
            <p className="muted">Each certificate gets a QR code. Anyone can verify it on the website's “Verify Certificate” page.</p>

            <form className="admin-form" onSubmit={submit}>
                <h3>{editingId ? 'Edit certificate' : 'Add certificate'}</h3>
                <div className="grid-2">
                    <div>
                        <label>Certificate ID {editingId ? '' : '(leave empty to auto-generate)'}</label>
                        <input value={form.certificateId} onChange={(e) => set('certificateId', e.target.value)} disabled={!!editingId} />
                    </div>
                    <div><label>Roll number *</label><input value={form.rollNumber} onChange={(e) => set('rollNumber', e.target.value)} required /></div>
                    <div><label>Student name *</label><input value={form.studentName} onChange={(e) => set('studentName', e.target.value)} required /></div>
                    <div><label>Course name *</label><input value={form.courseName} onChange={(e) => set('courseName', e.target.value)} required /></div>
                    <div><label>Issue date *</label><input type="date" value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)} required /></div>
                    <div><label>Grade</label><input value={form.grade} onChange={(e) => set('grade', e.target.value)} placeholder="A+" /></div>
                    <div><label>Duration</label><input value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="6 months" /></div>
                    <div className="span-2">
                        <label>Certificate file (image or PDF, optional)</label>
                        <MediaField value={form.certificateFileUrl} onChange={(v) => set('certificateFileUrl', v)} accept="image/*,application/pdf" folder="certificates" />
                    </div>
                </div>
                {error && <p className="error-msg">{error}</p>}
                {msg && <p style={{ color: '#16a34a' }}>{msg}</p>}
                <div className="form-actions">
                    {editingId && <button type="button" onClick={reset}>Cancel</button>}
                    <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Add certificate'}</button>
                </div>
                {lastQr && !editingId && (
                    <div style={{ marginTop: 14 }}>
                        <div className="muted" style={{ fontSize: 13 }}>QR code of the last certificate you added (right-click → save image):</div>
                        <img src={lastQr} alt="QR" style={{ width: 140, height: 140, marginTop: 6 }} />
                    </div>
                )}
            </form>

            <div className="admin-form">
                <h3>Bulk import (CSV)</h3>
                <p className="muted" style={{ marginTop: 0 }}>
                    Columns: <code>certificateId,rollNumber,studentName,courseName,issueDate,grade,duration</code> — certificateId can be empty (auto). issueDate like 2025-11-20. Existing IDs are updated.
                </p>
                <input type="file" accept=".csv,text/csv" onChange={(e) => setCsv(e.target.files?.[0] || null)} />
                <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                    <button className="btn-primary" type="button" disabled={!csv || importing} onClick={doImport}>{importing ? 'Importing…' : 'Import CSV'}</button>
                </div>
                {importRes && (
                    <p>
                        Imported <b>{importRes.success}</b> of {importRes.total}.{importRes.failedCount > 0 && <> Failed: <b>{importRes.failedCount}</b>.</>}
                        {importRes.failed?.map((f) => <div key={f.row} className="muted" style={{ fontSize: 12 }}>Row {f.row}: {f.error}</div>)}
                    </p>
                )}
            </div>

            <div className="admin-page-head" style={{ marginTop: 24 }}>
                <h3 style={{ margin: 0 }}>All certificates</h3>
                <input
                    style={{ maxWidth: 280 }}
                    placeholder="Search name / roll no / ID…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); load(e.target.value); }}
                />
            </div>

            <div className="banner-list">
                {list.map((c) => (
                    <div className="banner-card" key={c._id} style={c.isValid === false ? { opacity: 0.6 } : undefined}>
                        <div className="banner-meta" style={{ width: '100%' }}>
                            <div style={{ minWidth: 0 }}>
                                <strong>{c.studentName}</strong> <span className="muted">· Roll {c.rollNumber}</span>
                                <div className="muted" style={{ fontSize: 13 }}>{c.courseName}{c.grade ? ` · Grade ${c.grade}` : ''}{c.duration ? ` · ${c.duration}` : ''}</div>
                                <div className="muted" style={{ fontSize: 12 }}>ID {c.certificateId} · {new Date(c.issueDate).toLocaleDateString('en-GB')} · {c.isValid === false ? '⛔ Revoked' : '✅ Valid'}</div>
                            </div>
                            <div className="form-actions" style={{ marginTop: 0 }}>
                                <a href={`${API_URL}/certificates/${c._id}/pdf`} target="_blank" rel="noreferrer"><button type="button">PDF</button></a>
                                <button onClick={() => edit(c)}>Edit</button>
                                <button onClick={() => toggleValid(c)}>{c.isValid === false ? 'Restore' : 'Revoke'}</button>
                                <button className="btn-danger" onClick={() => remove(c)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {list.length === 0 && <p className="muted">No certificates found.</p>}
            </div>
        </div>
    );
}
