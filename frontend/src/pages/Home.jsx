import { useList } from '../hooks.js';
import HeroSlider from '../components/HeroSlider.jsx';
import Intro from '../components/Intro.jsx';
import ReelSection from '../components/ReelSection.jsx';
import Section from '../components/Section.jsx';
import { CourseGrid } from '../components/CourseCards.jsx';
import { NoticeGrid } from '../components/NoticeCards.jsx';
import { TeacherGrid } from '../components/TeacherCards.jsx';
import MidBanner from '../components/MidBanner.jsx';
import Testimonials from '../components/Testimonials.jsx';
import FAQ from '../components/FAQ.jsx';
import { Link } from 'react-router-dom';

export default function Home() {
    const hero = useList('/banners?placement=hero');
    const courses = useList('/courses');
    const notices = useList('/notices');
    const teachers = useList('/teachers');

    return (
        <>
            <HeroSlider slides={hero.items} loading={hero.loading} />
            <Intro compact={!hero.loading && hero.items.length === 0} />
            <ReelSection />

            {courses.items.length > 0 && (
                <Section title="OUR TOP COURSES" sub="Practical, instructor-led training built for real jobs." to="/courses" linkText="View all courses">
                    <CourseGrid items={courses.items.slice(0, 6)} />
                </Section>
            )}

            <section className="verify-band">
                <div className="container">
                    <h2>Certificates no one can fake</h2>
                    <p>Every certificate carries a unique roll number and QR code. Employers, parents and you can verify it instantly.</p>
                    <Link to="/verify-certificate" className="btn-primary light">Verify a Certificate</Link>
                </div>
            </section>

            <MidBanner />

            {notices.items.length > 0 && (
                <Section title="NOTICES & OFFERS" sub="Latest updates, offers and scholarships." to="/notices" alt>
                    <NoticeGrid items={notices.items.slice(0, 3)} />
                </Section>
            )}

            {teachers.items.length > 0 && (
                <Section title="OUR TEACHERS" sub="Qualified, experienced faculty." to="/teachers">
                    <TeacherGrid items={teachers.items.slice(0, 4)} />
                </Section>
            )}

            <Testimonials />
            <FAQ />
        </>
    );
}
