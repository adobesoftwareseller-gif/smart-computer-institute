import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { API_URL } from '../api.js';
import PageShell from '../components/PageShell.jsx';

export default function VerifyCertificate() {
    const [params] = useSearchParams();
    const idFromQr = params.get('id');
    const [rollNumber, setRollNumber] = useState(params.get('roll') || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    async function verify(query) {
        setLoading(true);
        setResult(null);
        try {
            const { data } = await api.get(`/certificates/verify?${query}`);
            setResult(data);
        } catch (e) {
            setResult(e.response?.data?.valid === false ? e.response.data : { valid: false, error: true });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (idFromQr) verify(`id=${encodeURIComponent(idFromQr)}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idFromQr]);

    const submit = (e) => {
        e.preventDefault();
        if (rollNumber.trim()) verify(`rollNumber=${encodeURIComponent(rollNumber.trim())}`);
    };

    const c = result?.certificate;

    return (
        <PageShell title="Verify a Certificate" sub="Enter the roll number printed on the certificate, or scan its QR code.">
            <div className="verify-panel">
                <form onSubmit={submit} className="verify-form">
                    <input type="text" placeholder="Enter Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
                    <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Checking…' : 'Verify'}</button>
                </form>

                {result?.valid && c && (
                    <div className="result-valid">
                        <h3>✅ Certificate Valid</h3>
                        <div className="result-row"><span>Name</span><b>{c.studentName}</b></div>
                        <div className="result-row"><span>Roll Number</span><b>{c.rollNumber}</b></div>
                        <div className="result-row"><span>Course</span><b>{c.courseName}</b></div>
                        <div className="result-row"><span>Grade</span><b>{c.grade || '-'}</b></div>
                        <div className="result-row"><span>Duration</span><b>{c.duration || '-'}</b></div>
                        <div className="result-row"><span>Issue Date</span><b>{new Date(c.issueDate).toLocaleDateString('en-GB')}</b></div>
                        <div className="result-actions">
                            {c.certificateFileUrl && (
                                <a href={c.certificateFileUrl} target="_blank" rel="noreferrer" className="btn-ghost s-btn-sm">View certificate</a>
                            )}
                            <a href={`${API_URL}/certificates/${c._id}/pdf`} className="btn-ghost s-btn-sm">Download PDF</a>
                        </div>
                    </div>
                )}

                {result && !result.valid && (
                    <div className="result-invalid">
                        <h3>❌ Certificate Not Found</h3>
                        <p>{result.error ? 'Could not reach the server. Please try again.' : 'Please check the roll number and try again.'}</p>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
