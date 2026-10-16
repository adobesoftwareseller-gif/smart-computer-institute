import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
    const { site } = useSite();
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => { setOpen(false); }, [pathname]);
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <header className="navbar">
            <div className="nav-inner">
                <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                    <span /><span /><span />
                </button>

                <Link to="/" className="brand" aria-label={site.siteName}>
                    <Logo />
                </Link>

                <nav className={`nav-links ${open ? 'open' : ''}`}>
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/courses">Courses</NavLink>
                    <NavLink to="/notices">Notices &amp; Offers</NavLink>
                    <NavLink to="/reels">Reels</NavLink>
                    <NavLink to="/teachers">Teachers</NavLink>
                    <NavLink to="/verify-certificate" className="nav-verify-mobile">Verify Certificate</NavLink>
                </nav>

                <div className="nav-actions">
                    {site.phone && (
                        <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="icon-btn" title={`Call ${site.phone}`} aria-label="Call us">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.7-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1C8.7 6.5 8.5 5.2 8.5 4c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" /></svg>
                        </a>
                    )}
                    <Link to="/verify-certificate" className="nav-cta">Verify Certificate</Link>
                </div>
            </div>
            {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}
        </header>
    );
}
