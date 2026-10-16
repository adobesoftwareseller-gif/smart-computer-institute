import AdminCrud from './AdminCrud.jsx';
import { isImage, isPdf } from '../api.js';

const order = { key: 'order', label: 'Order (small number shows first)', type: 'number', default: 0 };
const clip = (s = '', n = 110) => (s.length > n ? s.slice(0, n) + '…' : s);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '');

export const BANNERS = {
    path: '/banners', title: 'Banners', singular: 'Banner',
    help: 'Top slider banners (and an optional wide banner in the middle of the home page). Recommended size for the top slider: 1920 × 700 px.',
    fields: [
        { key: 'imageUrl', label: 'Banner image', type: 'media', accept: 'image/*', folder: 'banners', required: true, wide: true },
        { key: 'title', label: 'Title (for your reference / alt text)' },
        { key: 'subtitle', label: 'Subtitle' },
        { key: 'linkUrl', label: 'Link when clicked (optional)', placeholder: '/courses or https://…' },
        { key: 'placement', label: 'Where to show', type: 'select', options: [['hero', 'Top slider (home page)'], ['mid', 'Wide banner (middle of home page)']], default: 'hero' },
        order,
        { key: 'isActive', label: 'Show on website', type: 'checkbox' },
    ],
    view: (b) => ({ thumb: b.imageUrl, title: b.title || 'Banner', lines: [b.placement === 'mid' ? 'Middle banner' : 'Top slider', `Order: ${b.order}`] }),
};

export const REELS = {
    path: '/reels', title: 'Reels', singular: 'Reel', activeKey: 'isPublished', max: 15,
    help: 'Short videos shown in the “reels” strip on the home page. Upload a video (MP4/WebM/MOV, up to 100 MB) or paste a YouTube link. Vertical (9:16) videos look best.',
    fields: [
        { key: 'videoUrl', label: 'Video (upload or YouTube link)', type: 'media', accept: 'video/*', folder: 'reels', required: true, wide: true },
        { key: 'thumbnailUrl', label: 'Thumbnail image (optional)', type: 'media', accept: 'image/*', folder: 'reels', wide: true, hint: 'Uploaded videos and YouTube links get a thumbnail automatically.' },
        { key: 'title', label: 'Title (shown on the card)' },
        { key: 'category', label: 'Category (optional)', placeholder: 'Classes, Placement, Events…' },
        { key: 'label', label: 'Popup button text (optional)', placeholder: 'Enquire Now' },
        { key: 'link', label: 'Popup button link (optional)', placeholder: '/courses or https://…' },
        order,
        { key: 'isPublished', label: 'Show on website', type: 'checkbox' },
    ],
    view: (r) => ({ thumb: r.videoUrl && !r.thumbnailUrl ? r.videoUrl : r.thumbnailUrl, title: r.title || 'Reel', lines: [r.category, `Order: ${r.order}`] }),
};

export const NOTICES = {
    path: '/notices', title: 'Notices & Offers', singular: 'Notice',
    help: 'Notices, offers and scholarships. You can attach an image or a PDF.',
    fields: [
        { key: 'title', label: 'Title', required: true, wide: true },
        { key: 'type', label: 'Type', type: 'select', options: [['notice', 'Notice'], ['offer', 'Offer'], ['scholarship', 'Scholarship']], default: 'notice' },
        { key: 'validTill', label: 'Valid till (optional)', type: 'date' },
        { key: 'description', label: 'Description', type: 'textarea', wide: true },
        { key: 'attachmentUrl', label: 'Image or PDF (optional)', type: 'media', accept: 'image/*,application/pdf', folder: 'notices', wide: true },
        { key: 'isActive', label: 'Show on website', type: 'checkbox' },
    ],
    view: (n) => ({ thumb: isImage(n.attachmentUrl) ? n.attachmentUrl : '', title: n.title, lines: [n.type, n.validTill && `Valid till ${fmtDate(n.validTill)}`, clip(n.description), isPdf(n.attachmentUrl) && '📄 PDF attached'] }),
};

export const COURSES = {
    path: '/courses', title: 'Courses', singular: 'Course',
    fields: [
        { key: 'title', label: 'Course name', required: true },
        { key: 'duration', label: 'Duration', placeholder: '3 months' },
        { key: 'fee', label: 'Fee (optional)', placeholder: '₹4,999' },
        order,
        { key: 'imageUrl', label: 'Course image (optional)', type: 'media', accept: 'image/*', folder: 'courses', wide: true },
        { key: 'description', label: 'Description', type: 'textarea', wide: true },
        { key: 'isActive', label: 'Show on website', type: 'checkbox' },
    ],
    view: (c) => ({ thumb: c.imageUrl, title: c.title, lines: [[c.duration, c.fee].filter(Boolean).join(' · '), clip(c.description)] }),
};

export const TEACHERS = {
    path: '/teachers', title: 'Teachers', singular: 'Teacher',
    fields: [
        { key: 'name', label: 'Name', required: true },
        { key: 'designation', label: 'Designation', placeholder: 'Senior Faculty' },
        { key: 'experience', label: 'Experience', placeholder: '8 years' },
        order,
        { key: 'photoUrl', label: 'Photo', type: 'media', accept: 'image/*', folder: 'teachers', wide: true },
        { key: 'bio', label: 'Short bio', type: 'textarea', wide: true },
        { key: 'isActive', label: 'Show on website', type: 'checkbox' },
    ],
    view: (t) => ({ thumb: t.photoUrl, title: t.name, lines: [t.designation, t.experience, clip(t.bio)] }),
};

export const REVIEWS = {
    path: '/reviews', title: 'Reviews', singular: 'Review',
    help: 'Student reviews shown in the slider on the home page.',
    fields: [
        { key: 'name', label: 'Student name', required: true },
        { key: 'course', label: 'Course (optional)' },
        { key: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5, default: 5 },
        { key: 'date', label: 'Date text (optional)', placeholder: '20 NOV, 2025' },
        order,
        { key: 'photoUrl', label: 'Student photo (optional)', type: 'media', accept: 'image/*', folder: 'reviews' },
        { key: 'text', label: 'Review', type: 'textarea', rows: 5, required: true, wide: true },
        { key: 'isActive', label: 'Show on website', type: 'checkbox' },
    ],
    bigThumb: false,
    view: (r) => ({ title: r.name, lines: [`${r.rating}/5${r.course ? ' · ' + r.course : ''}`, clip(r.text, 160)] }),
};

export const STUDENTS = {
    path: '/students', title: 'Students', singular: 'Student',
    help: 'Your student records (only visible here — not shown on the website).',
    fields: [
        { key: 'name', label: 'Name', required: true },
        { key: 'rollNumber', label: 'Roll number' },
        { key: 'course', label: 'Course' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'joiningDate', label: 'Joining date', type: 'date' },
        { key: 'address', label: 'Address', type: 'textarea', wide: true, rows: 2 },
        { key: 'isActive', label: 'Active student', type: 'checkbox' },
    ],
    bigThumb: false,
    view: (s) => ({ title: s.name, lines: [[s.rollNumber && `Roll ${s.rollNumber}`, s.course].filter(Boolean).join(' · '), [s.phone, s.email].filter(Boolean).join(' · ')] }),
};

export const FAQS = {
    path: '/faqs', title: 'FAQs', singular: 'FAQ',
    fields: [
        { key: 'question', label: 'Question', required: true, wide: true },
        { key: 'answer', label: 'Answer', type: 'textarea', required: true, wide: true },
        order,
        { key: 'isActive', label: 'Show on website', type: 'checkbox' },
    ],
    bigThumb: false,
    view: (f) => ({ title: f.question, lines: [clip(f.answer, 140)] }),
};

export const PROMOS = {
    path: '/promo-messages', title: 'Top Scrolling Strip', singular: 'Message',
    help: 'Short messages that scroll across the very top of the website — e.g. “Admissions open · 20% scholarship till 30 Nov”.',
    fields: [
        { key: 'text', label: 'Message', required: true, wide: true },
        order,
        { key: 'isActive', label: 'Show on website', type: 'checkbox' },
    ],
    bigThumb: false,
    view: (m) => ({ title: m.text, lines: [`Order: ${m.order}`] }),
};

export const AdminBanners = () => <AdminCrud cfg={BANNERS} />;
export const AdminReels = () => <AdminCrud cfg={REELS} />;
export const AdminNotices = () => <AdminCrud cfg={NOTICES} />;
export const AdminCourses = () => <AdminCrud cfg={COURSES} />;
export const AdminTeachers = () => <AdminCrud cfg={TEACHERS} />;
export const AdminReviews = () => <AdminCrud cfg={REVIEWS} />;
export const AdminStudents = () => <AdminCrud cfg={STUDENTS} />;
export const AdminFaqs = () => <AdminCrud cfg={FAQS} />;
export const AdminPromos = () => <AdminCrud cfg={PROMOS} />;
