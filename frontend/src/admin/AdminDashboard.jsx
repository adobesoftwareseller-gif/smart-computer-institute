import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import Loader from './Loader.jsx';

const CARDS = [
    ['banners', 'Banners', '/admin/banners'],
    ['reels', 'Reels', '/admin/reels'],
    ['notices', 'Notices & Offers', '/admin/notices'],
    ['certificates', 'Certificates', '/admin/certificates'],
    ['courses', 'Courses', '/admin/courses'],
    ['teachers', 'Teachers', '/admin/teachers'],
    ['reviews', 'Reviews', '/admin/reviews'],
    ['students', 'Students', '/admin/students'],
];

export default function AdminDashboard() {
    const [counts, setCounts] = useState(null);

    useEffect(() => {
        api.get('/dashboard/counts').then((r) => setCounts(r.data)).catch(() => setCounts({}));
    }, []);

    return (
        <div>
            <h1 className="admin-title">Dashboard</h1>
            <p className="muted">Everything on your website is managed from here.</p>

            {!counts ? <Loader label="Loading…" /> : (
                <div className="admin-stats">
                    {CARDS.map(([k, label, to]) => (
                        <Link to={to} className="stat" key={k} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="stat-label">{label}</div>
                            <div className="stat-value">{counts[k] ?? '–'}</div>
                        </Link>
                    ))}
                    <Link to="/admin/settings" className="stat" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="stat-label">Logo, colours, contact</div>
                        <div className="stat-value" style={{ fontSize: 18 }}>Site Settings →</div>
                    </Link>
                </div>
            )}
        </div>
    );
}
