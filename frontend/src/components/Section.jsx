import { Link } from 'react-router-dom';

// Standard "title + optional View all" block used on the home page
export default function Section({ title, sub, to, linkText = 'View all', alt = false, children }) {
    return (
        <section className={`s-section${alt ? ' alt' : ''}`}>
            <div className="container">
                <div className="s-head">
                    <div>
                        <h2 className="s-title">{title}</h2>
                        {sub && <p className="s-sub">{sub}</p>}
                    </div>
                    {to && <Link to={to} className="btn-ghost s-btn-sm">{linkText}</Link>}
                </div>
                {children}
            </div>
        </section>
    );
}
