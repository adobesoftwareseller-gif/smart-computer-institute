import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';

const NAV = [
    ['/admin', 'Dashboard', true],
    ['/admin/banners', 'Banners'],
    ['/admin/reels', 'Reels'],
    ['/admin/notices', 'Notices & Offers'],
    ['/admin/certificates', 'Certificates'],
    ['/admin/courses', 'Courses'],
    ['/admin/teachers', 'Teachers'],
    ['/admin/reviews', 'Reviews'],
    ['/admin/students', 'Students'],
    ['/admin/faqs', 'FAQs'],
    ['/admin/promo-messages', 'Top Strip'],
    ['/admin/settings', 'Site Settings & Logo'],
];

export default function AdminLayout() {
    const { isAuthed, admin, logout } = useAdminAuth();
    const { site } = useSite();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    if (!isAuthed) return <Navigate to="/admin/login" replace />;
    const name = site.shortName || 'Admin';

    return (
        <div className="admin-shell">
            <header className="admin-topbar">
                <div className="admin-brand">{name}</div>
                <button className="admin-hamburger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
                    {menuOpen ? '✕' : '☰'}
                </button>
            </header>
            {menuOpen && <div className="admin-overlay" onClick={() => setMenuOpen(false)} />}
            <aside className={`admin-sidebar${menuOpen ? ' open' : ''}`}>
                <div className="admin-brand">{name}</div>
                <p className="admin-sub">Admin Panel</p>
                <nav className="admin-nav" onClick={() => setMenuOpen(false)}>
                    {NAV.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
                    <a href="/" target="_blank" rel="noreferrer">View website ↗</a>
                </nav>
                <div className="admin-user">
                    <div>{admin?.name}</div>
                    <small>{admin?.email}</small>
                    <button className="btn-logout" onClick={() => { logout(); navigate('/admin/login'); }}>Logout</button>
                </div>
            </aside>
            <main className="admin-main"><Outlet /></main>
        </div>
    );
}
