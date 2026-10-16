import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';

// Heading + numbers under the banner (all editable in Admin -> Settings)
export default function Intro({ compact = false }) {
    const { site } = useSite();
    const stats = (site.stats || []).filter((s) => s.value || s.label);
    if (compact && !stats.length) return null;
    return (
        <section className="intro">
            <div className="container">
                {!compact && (
                    <>
                        <h2 className="intro-title">{site.heroTitle}</h2>
                        <p className="intro-text">{site.heroText}</p>
                        <div className="hero-actions center">
                            <Link to="/courses" className="btn-primary">Explore Courses</Link>
                            <Link to="/verify-certificate" className="btn-ghost">Verify a Certificate</Link>
                        </div>
                    </>
                )}
                {stats.length > 0 && (
                    <div className="stat-row">
                        {stats.map((s, i) => (
                            <div key={i}>
                                <div className="stat-num">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
