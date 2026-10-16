import { useList } from '../hooks.js';

export default function PromoBar() {
    const { items } = useList('/promo-messages');
    const messages = items.map((m) => m.text).filter(Boolean);
    if (!messages.length) return null;
    const all = [...messages, ...messages];
    return (
        <div className="promo-bar">
            <div className="promo-track">
                {all.map((m, i) => <span key={i}>{m}</span>)}
            </div>
        </div>
    );
}
