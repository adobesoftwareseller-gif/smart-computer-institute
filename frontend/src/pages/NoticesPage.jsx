import { useList } from '../hooks.js';
import PageShell from '../components/PageShell.jsx';
import { NoticeGrid } from '../components/NoticeCards.jsx';

export default function NoticesPage() {
    const { items, loading } = useList('/notices');
    return (
        <PageShell title="Notices, Offers & Scholarships" sub="Latest updates from our institute." loading={loading} empty={!items.length} emptyText="No notices at the moment.">
            <NoticeGrid items={items} />
        </PageShell>
    );
}
