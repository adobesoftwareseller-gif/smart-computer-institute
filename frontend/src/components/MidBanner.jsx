import { Link } from 'react-router-dom';
import { useList } from '../hooks.js';

export default function MidBanner() {
    const { items } = useList('/banners?placement=mid');
    const b = items[0];
    if (!b) return null;
    const img = <img src={b.imageUrl} alt={b.title || 'Promotion'} loading="lazy" />;
    return (
        <section className="promo-banner">
            {!b.linkUrl ? img : /^https?:/i.test(b.linkUrl)
                ? <a href={b.linkUrl} target="_blank" rel="noreferrer">{img}</a>
                : <Link to={b.linkUrl}>{img}</Link>}
        </section>
    );
}
