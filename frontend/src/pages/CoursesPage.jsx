import { useList } from '../hooks.js';
import PageShell from '../components/PageShell.jsx';
import { CourseGrid } from '../components/CourseCards.jsx';

export default function CoursesPage() {
    const { items, loading } = useList('/courses');
    return (
        <PageShell title="Our Courses" sub="Practical, instructor-led training built for real jobs." loading={loading} empty={!items.length} emptyText="Courses coming soon — check back shortly.">
            <CourseGrid items={items} />
        </PageShell>
    );
}
