import { useRef, useState } from 'react';
import api, { errMsg, isDirectVideo, isImage, isPdf, youTubeId } from '../api.js';

/**
 * Upload (to Cloudinary via the API) or paste a link.
 *  accept: "image/*" | "video/*" | "image/*,application/pdf"
 *  folder: banners | reels | notices | certificates | teachers | courses | reviews | branding
 */
export default function MediaField({ value, onChange, accept = 'image/*', folder = 'general', allowLink = true, hint }) {
    const ref = useRef(null);
    const [busy, setBusy] = useState(false);
    const [pct, setPct] = useState(0);
    const [error, setError] = useState('');

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(''); setBusy(true); setPct(0);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post(`/upload?folder=${folder}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (ev) => ev.total && setPct(Math.round((ev.loaded / ev.total) * 100)),
                timeout: 0,
            });
            onChange(data.url);
        } catch (err) {
            setError(errMsg(err, 'Upload failed'));
        } finally {
            setBusy(false);
            if (ref.current) ref.current.value = '';
        }
    };

    const yt = youTubeId(value || '');

    return (
        <div className="media-field">
            <input ref={ref} type="file" accept={accept} onChange={onFile} disabled={busy} />
            {busy && <div className="muted" style={{ marginTop: 6 }}>Uploading… {pct}%</div>}
            {error && <div className="error-msg" style={{ marginTop: 6 }}>{error}</div>}
            {hint && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{hint}</div>}
            {allowLink && (
                <input
                    style={{ marginTop: 8 }}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="…or paste a link (https://…)"
                />
            )}
            {value && !busy && (
                <div style={{ marginTop: 8 }}>
                    {isDirectVideo(value) ? <video src={value} controls muted className="img-preview wide" style={{ maxHeight: 220 }} />
                        : yt ? <img src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`} alt="YouTube" className="img-preview" />
                        : isImage(value) ? <img src={value} alt="preview" className="img-preview wide" />
                        : isPdf(value) ? <a href={value} target="_blank" rel="noreferrer">📄 View uploaded PDF</a>
                        : <a href={value} target="_blank" rel="noreferrer">Open file</a>}
                    <div><button type="button" className="btn-link" onClick={() => onChange('')}>Remove</button></div>
                </div>
            )}
        </div>
    );
}
