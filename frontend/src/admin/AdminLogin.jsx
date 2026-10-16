import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { errMsg } from '../api.js';
import Logo from '../components/Logo.jsx';

export default function AdminLogin() {
    const { login, isAuthed } = useAdminAuth();
    const { site } = useSite();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    if (isAuthed) return <Navigate to="/admin" replace />;

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            setError(errMsg(err, 'Login failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <form onSubmit={submit} className="admin-login-card">
                <div style={{ marginBottom: 10 }}><Logo /></div>
                <h2>Admin Sign In</h2>
                <p className="muted">Manage {site.shortName || 'your website'} — banners, reels, notices, certificates and more.</p>

                <label>Email</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />

                <label>Password</label>
                <div style={{ position: 'relative' }}>
                    <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        style={{ paddingRight: 70 }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 0,
                            color: 'var(--brand)',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {showPw ? 'Hide' : 'Show'}
                    </button>
                </div>

                {error && <p className="error-msg">{error}</p>}

                <button className="btn-primary" disabled={loading} style={{ marginTop: 12, width: '100%' }}>
                    {loading ? 'Signing in…' : 'Sign In →'}
                </button>
            </form>
        </div>
    );
}