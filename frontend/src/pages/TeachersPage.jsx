import { useList } from '../hooks.js';
import PageShell from '../components/PageShell.jsx';
import { TeacherGrid } from '../components/TeacherCards.jsx';

export default function TeachersPage() {
    const { items, loading } = useList('/teachers');
    return (
        <PageShell title="Our Teachers" sub="Learn from qualified, experienced faculty." loading={loading} empty={!items.length} emptyText="Teacher profiles coming soon.">
            <TeacherGrid items={items} />
        </PageShell>
    );
}
