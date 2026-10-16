import { useSite } from '../context/SiteContext.jsx';
import { waLink } from '../api.js';

export function CourseCard({ c }) {
    const { site } = useSite();
    const apply = site.whatsapp
        ? waLink(site.whatsapp, `Hello, I want to know about the ${c.title} course.`)
        : site.phone ? `tel:${site.phone.replace(/\s/g, '')}` : '';
    return (
        <article className="s-card course-card">
            {c.imageUrl && <img src={c.imageUrl} alt={c.title} className="s-card-img" loading="lazy" />}
            <div className="s-card-body">
                <div className="s-badges">
                    {c.duration && <span className="s-badge">{c.duration}</span>}
                    {c.fee && <span className="s-badge alt">{c.fee}</span>}
                </div>
                <h3>{c.title}</h3>
                {c.description && <p>{c.description}</p>}
                {apply && (
                    <a href={apply} target={apply.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="btn-primary s-btn">
                        Apply Now
                    </a>
                )}
            </div>
        </article>
    );
}

export function CourseGrid({ items }) {
    return <div className="s-grid">{items.map((c) => <CourseCard key={c._id} c={c} />)}</div>;
}
