import { isImage } from '../api.js';

const LABEL = { notice: 'Notice', offer: 'Offer', scholarship: 'Scholarship' };

export function NoticeCard({ n }) {
    const expired = n.validTill && new Date(n.validTill) < new Date(new Date().toDateString());
    return (
        <article className="s-card notice-card">
            {n.attachmentUrl && isImage(n.attachmentUrl) && (
                <a href={n.attachmentUrl} target="_blank" rel="noreferrer">
                    <img src={n.attachmentUrl} alt={n.title} className="s-card-img" loading="lazy" />
                </a>
            )}
            <div className="s-card-body">
                <div className="s-badges">
                    <span className={`s-badge type-${n.type}`}>{LABEL[n.type] || n.type}</span>
                    {expired && <span className="s-badge muted">Expired</span>}
                </div>
                <h3>{n.title}</h3>
                {n.description && <p>{n.description}</p>}
                {n.attachmentUrl && !isImage(n.attachmentUrl) && (
                    <a href={n.attachmentUrl} target="_blank" rel="noreferrer" className="btn-ghost s-btn">View / Download</a>
                )}
                {n.validTill && <div className="s-meta">Valid till {new Date(n.validTill).toLocaleDateString('en-GB')}</div>}
            </div>
        </article>
    );
}

export function NoticeGrid({ items }) {
    return <div className="s-grid">{items.map((n) => <NoticeCard key={n._id} n={n} />)}</div>;
}
