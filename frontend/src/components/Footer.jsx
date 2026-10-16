import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import Logo from './Logo.jsx';

const Icon = ({ d }) => (
    <span className="contact-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
    </span>
);

export default function Footer() {
    const { site } = useSite();
    const social = [
        ['instagram', 'Instagram', <svg key="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>],
        ['facebook', 'Facebook', <svg key="f" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8V6.5c0-.7.3-1 1-1h2V2h-3c-3 0-4.5 1.8-4.5 4.4V8H7v3.5h2.5V22H14V11.5h2.7L17 8z" /></svg>],
        ['youtube', 'YouTube', <svg key="y" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5 3z" /></svg>],
    ].filter(([k]) => site[k]);

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Logo variant="footer" />
                        <p className="footer-desc">{site.aboutText || site.siteName}</p>
                        {social.length > 0 && (
                            <div className="footer-socials">
                                {social.map(([k, label, svg]) => (
                                    <a key={k} href={site[k]} target="_blank" rel="noopener noreferrer" aria-label={label} className="social-icon">{svg}</a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/courses">Courses</Link></li>
                            <li><Link to="/notices">Notices &amp; Offers</Link></li>
                            <li><Link to="/reels">Reels</Link></li>
                            <li><Link to="/teachers">Teachers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Students</h4>
                        <ul className="footer-links">
                            <li><Link to="/verify-certificate">Verify Certificate</Link></li>
                            <li><Link to="/notices">Scholarships</Link></li>
                            <li><Link to="/courses">Apply for a Course</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Contact Us</h4>
                        <ul className="footer-contact">
                            {site.phone && <li><Icon d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.7-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1C8.7 6.5 8.5 5.2 8.5 4c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" /><span>{site.phone}</span></li>}
                            {site.email && <li><Icon d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /><span>{site.email}</span></li>}
                            {site.address && <li><Icon d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.100-7-7-7zm0 9.500c-1.400 0-2.500-1.100-2.500-2.500S10.600 6.500 12 6.500s2.500 1.100 2.500 2.500S13.400 11.500 12 11.500z" /><span style={{ whiteSpace: 'pre-line' }}>{site.address}</span></li>}
                        </ul>
                    </div>
                </div>

                <div className="copyright">
                    <span>© Copyright {new Date().getFullYear()} All Rights Reserved by {site.siteName}</span>
                </div>
            </div>
        </footer>
    );
}
