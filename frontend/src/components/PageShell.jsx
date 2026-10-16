// Page title block + content wrapper for the inner pages
export default function PageShell({ title, sub, loading, empty, emptyText, children }) {
    return (
        <>
            <section className="s-pagehead">
                <div className="container">
                    <h1>{title}</h1>
                    {sub && <p>{sub}</p>}
                </div>
            </section>
            <section className="s-section">
                <div className="container">
                    {loading ? <p className="s-empty">Loading…</p> : empty ? <p className="s-empty">{emptyText}</p> : children}
                </div>
            </section>
        </>
    );
}
