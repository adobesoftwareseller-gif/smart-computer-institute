import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar.jsx';
import PromoBar from './components/PromoBar.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Home from './pages/Home.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import NoticesPage from './pages/NoticesPage.jsx';
import ReelsPage from './pages/ReelsPage.jsx';
import TeachersPage from './pages/TeachersPage.jsx';
import VerifyCertificate from './pages/VerifyCertificate.jsx';

import { AdminAuthProvider } from './admin/AuthContext.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminCertificates from './admin/AdminCertificates.jsx';
import AdminSettings from './admin/AdminSettings.jsx';
import {
    AdminBanners, AdminReels, AdminNotices, AdminCourses, AdminTeachers,
    AdminReviews, AdminStudents, AdminFaqs, AdminPromos,
} from './admin/AdminModules.jsx';

function NotFound() {
    return (
        <section className="s-pagehead">
            <div className="container"><h1>Page not found</h1><p><a href="/" style={{ textDecoration: 'underline' }}>Go to home page</a></p></div>
        </section>
    );
}

export default function App() {
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <AdminAuthProvider>
            <ScrollToTop />
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop closeOnClick pauseOnHover={false} theme="light" />
            {!isAdmin && <PromoBar />}
            {!isAdmin && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/notices" element={<NoticesPage />} />
                <Route path="/reels" element={<ReelsPage />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/verify-certificate" element={<VerifyCertificate />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="reels" element={<AdminReels />} />
                    <Route path="notices" element={<AdminNotices />} />
                    <Route path="certificates" element={<AdminCertificates />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="teachers" element={<AdminTeachers />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="students" element={<AdminStudents />} />
                    <Route path="faqs" element={<AdminFaqs />} />
                    <Route path="promo-messages" element={<AdminPromos />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
            {!isAdmin && <Footer />}
        </AdminAuthProvider>
    );
}
