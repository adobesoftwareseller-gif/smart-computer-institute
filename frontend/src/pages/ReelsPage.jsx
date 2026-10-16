import { useList } from '../hooks.js';
import ReelSection from '../components/ReelSection.jsx';

export default function ReelsPage() {
    const { items, loading } = useList('/reels');
    return (
        <>
            <section className="s-pagehead">
                <div className="container">
                    <h1>Reels &amp; Videos</h1>
                    <p>Moments from our classes, events and placements.</p>
                </div>
            </section>
            {!loading && !items.length ? <p className="s-empty" style={{ padding: 40 }}>No reels published yet.</p> : <ReelSection heading="WATCH & EXPLORE" />}
        </>
    );
}
