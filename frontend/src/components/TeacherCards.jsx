export function TeacherGrid({ items }) {
    return (
        <div className="s-grid teachers">
            {items.map((t) => (
                <article className="s-card teacher-card" key={t._id}>
                    {t.photoUrl
                        ? <img src={t.photoUrl} alt={t.name} className="teacher-photo" loading="lazy" />
                        : <div className="teacher-photo ph">{(t.name || '?').charAt(0).toUpperCase()}</div>}
                    <h3>{t.name}</h3>
                    {t.designation && <div className="teacher-role">{t.designation}</div>}
                    {t.experience && <div className="s-badge alt">{t.experience}</div>}
                    {t.bio && <p>{t.bio}</p>}
                </article>
            ))}
        </div>
    );
}
