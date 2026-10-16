import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api.js';

const DEFAULTS = {
    siteName: 'Smart Computer Education Society',
    shortName: 'Smart Computers',
    tagline: 'Computer Education & Placement',
    logoUrl: '',
    footerLogoUrl: '',
    faviconUrl: '',
    brandColor: '#7a1f2b',
    heroTitle: 'Turn your skills into a career-ready certificate.',
    heroText: 'Industry-ready computer courses, backed by certificates with a roll number and QR code that anyone can verify instantly.',
    stats: [],
    aboutText: '',
    phone: '', whatsapp: '', email: '', address: '',
    instagram: '', facebook: '', youtube: '',
    reelsHeading: 'LIFE AT OUR INSTITUTE',
};

const Ctx = createContext({ site: DEFAULTS, ready: false, reload: () => {} });

// ---- colour helpers: build the whole palette from one brand colour ----
function mix(hex, other, t) {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = p(hex), b = p(other);
    return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function applyBrand(color) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color || '')) return;
    const r = document.documentElement.style;
    r.setProperty('--brand', color);
    r.setProperty('--brand-2', mix(color, '#ffffff', 0.15));
    r.setProperty('--brand-dark', mix(color, '#000000', 0.5));
    r.setProperty('--brand-soft', mix(color, '#ffffff', 0.92));
    r.setProperty('--brand-soft-2', mix(color, '#ffffff', 0.84));
}

function cached() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('site_settings') || '{}') }; } catch { return DEFAULTS; }
}

export function SiteProvider({ children }) {
    const [site, setSite] = useState(cached);
    const [ready, setReady] = useState(false);

    const load = (fresh = false) =>
        api.get('/settings', fresh ? { params: { _t: Date.now() } } : undefined)
            .then((r) => {
                const s = { ...DEFAULTS, ...r.data };
                setSite(s);
                localStorage.setItem('site_settings', JSON.stringify(s));
            })
            .catch(() => {})
            .finally(() => setReady(true));

    useEffect(() => { load(); }, []);
    const reload = () => load(true);

    useEffect(() => {
        applyBrand(site.brandColor);
        if (site.siteName) document.title = site.tagline ? `${site.siteName} | ${site.tagline}` : site.siteName;
        if (site.faviconUrl || site.logoUrl) {
            let link = document.querySelector("link[rel='icon']");
            if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
            link.removeAttribute('type');
            link.href = site.faviconUrl || site.logoUrl;
        }
    }, [site]);

    return <Ctx.Provider value={{ site, ready, reload }}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);
