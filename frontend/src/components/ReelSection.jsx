import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useList } from '../hooks.js';
import { useSite } from '../context/SiteContext.jsx';
import { isDirectVideo, videoPoster, youTubeId } from '../api.js';
import { ReelSkeleton } from './Skeleton.jsx';

const thumbOf = (r) => {
    if (r.thumbnailUrl) return r.thumbnailUrl;
    const yt = youTubeId(r.videoUrl);
    if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
    return videoPoster(r.videoUrl);
};

function CtaLink({ reel, onClose }) {
    if (!reel.link) return null;
    const text = reel.label || 'Know More';
    if (/^https?:/i.test(reel.link)) {
        return <a href={reel.link} target="_blank" rel="noreferrer" className="reel-modal-cta">{text}</a>;
    }
    return <Link to={reel.link} className="reel-modal-cta" onClick={onClose}>{text}</Link>;
}

export default function ReelSection({ heading }) {
    const { items: reels, loading } = useList('/reels');
    const { site } = useSite();
    const [activeIdx, setActiveIdx] = useState(-1);
    const trackRef = useRef(null);

    // play uploaded videos only while they are on screen
    useEffect(() => {
        if (!reels.length) return;
        const vids = trackRef.current?.querySelectorAll('video') || [];
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())),
            { threshold: 0.4 }
        );
        vids.forEach((v) => io.observe(v));
        return () => io.disconnect();
    }, [reels]);

    if (loading) return <ReelSkeleton />;
    if (!reels.length) return null;

    const scrollBy = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.querySelector('.reel-card');
        el.scrollBy({ left: dir * (card ? card.offsetWidth + 16 : 320) * 2, behavior: 'smooth' });
    };

    return (
        <section className="reel-section">
            <h2 className="reel-heading">{heading || site.reelsHeading || 'LIFE AT OUR INSTITUTE'}</h2>

            <div className="reel-wrap">
                <button className="reel-arrow left" onClick={() => scrollBy(-1)} aria-label="Previous">‹</button>

                <div className="reel-track" ref={trackRef}>
                    {reels.map((r, i) => (
                        <button key={r._id} className="reel-card" onClick={() => setActiveIdx(i)} aria-label={`Open reel ${r.title || ''}`}>
                            {isDirectVideo(r.videoUrl) ? (
                                <video src={r.videoUrl} poster={thumbOf(r) || undefined} muted loop autoPlay playsInline preload="metadata" />
                            ) : (
                                <img src={thumbOf(r)} alt={r.title || 'Reel'} loading="lazy" />
                            )}
                            <span className="reel-cta">{r.title || r.category || 'Watch'}</span>
                        </button>
                    ))}
                </div>

                <button className="reel-arrow right" onClick={() => scrollBy(1)} aria-label="Next">›</button>
            </div>

            {activeIdx >= 0 && (
                <ReelLightbox reels={reels} index={activeIdx} setIndex={setActiveIdx} onClose={() => setActiveIdx(-1)} />
            )}
        </section>
    );
}

function Player({ reel, videoRef }) {
    const yt = youTubeId(reel.videoUrl);
    if (isDirectVideo(reel.videoUrl)) {
        return <video key={reel._id} ref={videoRef} src={reel.videoUrl} poster={thumbOf(reel) || undefined} controls autoPlay loop playsInline />;
    }
    if (yt) {
        return (
            <iframe
                key={reel._id}
                title={reel.title || 'Video'}
                src={`https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 0, background: '#000' }}
            />
        );
    }
    return (
        <a href={reel.videoUrl} target="_blank" rel="noreferrer" className="reel-modal-cta" style={{ position: 'static', display: 'inline-block', margin: 20 }}>
            Watch video
        </a>
    );
}

function ReelLightbox({ reels, index, setIndex, onClose }) {
    const videoRef = useRef(null);
    const reel = reels[index];

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft' && index > 0) setIndex(index - 1);
            else if (e.key === 'ArrowRight' && index < reels.length - 1) setIndex(index + 1);
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [index, reels.length, setIndex, onClose]);

    // try with sound; browsers may block -> fall back to muted
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = false;
        v.currentTime = 0;
        const p = v.play();
        if (p && p.catch) p.catch(() => { v.muted = true; v.play().catch(() => {}); });
    }, [index]);

    if (!reel) return null;
    const prev = reels[index - 1];
    const next = reels[index + 1];
    const Side = ({ r, side, to }) => (
        <div className={`reel-modal-side ${side}`} onClick={() => setIndex(to)}>
            {isDirectVideo(r.videoUrl)
                ? <video src={r.videoUrl} muted loop autoPlay playsInline />
                : <img src={thumbOf(r)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
    );

    return (
        <div className="reel-modal" onClick={onClose}>
            <button className="reel-modal-close" onClick={onClose} aria-label="Close">×</button>
            {prev && <button className="reel-modal-prev" onClick={(e) => { e.stopPropagation(); setIndex(index - 1); }} aria-label="Previous">‹</button>}

            <div className="reel-modal-stage" onClick={(e) => e.stopPropagation()}>
                {prev && <Side r={prev} side="left" to={index - 1} />}
                <div className="reel-modal-active">
                    <Player reel={reel} videoRef={videoRef} />
                    <CtaLink reel={reel} onClose={onClose} />
                </div>
                {next && <Side r={next} side="right" to={index + 1} />}
            </div>

            {next && <button className="reel-modal-next" onClick={(e) => { e.stopPropagation(); setIndex(index + 1); }} aria-label="Next">›</button>}
        </div>
    );
}
