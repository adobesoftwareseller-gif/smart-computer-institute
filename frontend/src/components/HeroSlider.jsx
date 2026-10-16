import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import { HeroSkeleton } from './Skeleton.jsx';

const isExternal = (u = '') => /^https?:/i.test(u);

function Wrap({ href, children }) {
    if (!href) return children;
    if (isExternal(href)) return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
    return <Link to={href}>{children}</Link>;
}

export default function HeroSlider({ slides = [], loading = false }) {
    const { site } = useSite();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
        return () => clearInterval(id);
    }, [slides.length]);

    if (loading) return <HeroSkeleton />;

    // No banner uploaded yet -> friendly text hero so the page never looks empty
    if (!slides.length) {
        return (
            <section className="hero-fallback">
                <div className="container">
                    <span className="hero-eyebrow">{site.tagline}</span>
                    <h1>{site.heroTitle}</h1>
                    <p>{site.heroText}</p>
                    <div className="hero-actions">
                        <Link to="/courses" className="btn-primary">Explore Courses</Link>
                        <Link to="/verify-certificate" className="btn-ghost">Verify a Certificate</Link>
                    </div>
                </div>
            </section>
        );
    }

    const go = (d) => setIndex((i) => (i + d + slides.length) % slides.length);

    return (
        <section className="hero-slider">
            <div className="hero-slider-track" style={{ transform: `translateX(-${index * 100}%)` }}>
                {slides.map((s, i) => (
                    <div className="hero-slide" key={s._id || i}>
                        <Wrap href={s.linkUrl}>
                            <img src={s.imageUrl} alt={s.title || `Banner ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
                        </Wrap>
                    </div>
                ))}
            </div>
            {slides.length > 1 && (
                <>
                    <button className="hero-arrow left" onClick={() => go(-1)} aria-label="Previous banner">‹</button>
                    <button className="hero-arrow right" onClick={() => go(1)} aria-label="Next banner">›</button>
                    <div className="hero-dots">
                        {slides.map((s, i) => (
                            <button key={s._id || i} className={'hero-dot' + (i === index ? ' active' : '')} onClick={() => setIndex(i)} aria-label={`Banner ${i + 1}`} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
