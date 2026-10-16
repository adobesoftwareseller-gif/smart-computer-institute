import { useSite } from '../context/SiteContext.jsx';

// Shows the logo uploaded in Admin -> Settings. Until one is uploaded, a text logo is shown.
export default function Logo({ variant = 'header' }) {
    const { site } = useSite();
    const src = variant === 'footer' ? site.footerLogoUrl || site.logoUrl : site.logoUrl;

    if (src) {
        return (
            <img
                src={src}
                alt={site.shortName || site.siteName}
                className={variant === 'footer' ? 'footer-logo' : 'brand-logo'}
                style={{ 
                    transform: variant === 'header' ? 'scale(1.25)' : 'none', 
                    transformOrigin: 'left center',
                    height: variant === 'header' ? '60px' : '100px',
                    width: 'auto'
                }}
            />
        );
    }
    return (
        <span className={`text-logo ${variant}`}>
            <span className="text-logo-mark" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="10" y="12" width="44" height="30" rx="4" />
                    <path d="M24 52h16M32 42v10" />
                </svg>
            </span>
            <span className="text-logo-name">{site.shortName || site.siteName}</span>
        </span>
    );
}