import axios from 'axios';

// Backend URL: VITE_API_URL (or NEXT_PUBLIC_API_URL). "https://x.onrender.com" and
// "https://x.onrender.com/api" are both fine.
const raw =
    import.meta.env.VITE_API_URL ||
    import.meta.env.NEXT_PUBLIC_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000' : '');
const origin = String(raw).replace(/\/+$/, '').replace(/\/api$/, '');

export const API_ORIGIN = origin;
export const API_URL = `${origin}/api`;

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// If the admin token expires, send the admin back to the login page.
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const onAdmin = window.location.pathname.startsWith('/admin');
        const onLogin = window.location.pathname.startsWith('/admin/login');
        if (err.response?.status === 401 && onAdmin && !onLogin && localStorage.getItem('admin_token')) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(err);
    }
);

export const errMsg = (e, fallback = 'Something went wrong') =>
    e?.response?.data?.error || e?.response?.data?.message || fallback;

// ---- media helpers ----
export const isPdf = (u = '') => /\.pdf(\?|$)/i.test(u);
export const isDirectVideo = (u = '') =>
    /\.(mp4|webm|mov|ogg)(\?|$)/i.test(u) || /res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(u);
export const isImage = (u = '') =>
    !!u && !isPdf(u) && !isDirectVideo(u) && (/\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(u) || /\/image\/upload\//.test(u));

export function youTubeId(url = '') {
    const m =
        url.match(/youtu\.be\/([\w-]{11})/) ||
        url.match(/youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)([\w-]{11})/);
    return m ? m[1] : null;
}
export function instagramId(url = '') {
    const m = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([\w-]+)/);
    return m ? m[1] : null;
}

// Cloudinary can make a poster image from any uploaded video
export function videoPoster(url = '') {
    if (!/res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(url)) return '';
    return url.replace('/video/upload/', '/video/upload/so_0,w_480,q_auto/').replace(/\.[a-z0-9]+(\?.*)?$/i, '.jpg');
}

export const waLink = (number = '', text = '') =>
    `https://wa.me/${String(number).replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export default api;
