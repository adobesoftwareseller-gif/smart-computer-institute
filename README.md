# Smart Computers — Website + Admin Panel

GenZdial wala layout + Smart Computer Education Society ke saare features, ek hi project me.

```
smart-computers/
├── frontend/   → Website + Admin panel (React + Vite)   → Vercel
├── backend/    → API (Node + Express + MongoDB)         → Render
└── render.yaml → Render blueprint (backend)
```

## Admin panel se kya-kya control hota hai  (`/admin`)
| Section | Kya karta hai |
|---|---|
| **Banners** | Home page ka top slider + beech wala wide banner (upload, order, hide/show, link) |
| **Reels** | Video upload (MP4/WebM/MOV, 100MB tak) ya YouTube link, thumbnail, popup button |
| **Notices & Offers** | Notice / Offer / Scholarship — image ya PDF attach, valid-till date |
| **Certificates** | Add/Edit/Revoke, QR code auto, file upload, PDF download, CSV bulk import |
| **Courses / Teachers / Reviews / FAQs** | Home page ke sections |
| **Students** | Sirf admin ke liye records |
| **Top Strip** | Navbar ke upar scrolling offer line |
| **Site Settings & Logo** | **Logo, footer logo, favicon, brand colour**, naam, home heading, numbers, phone/WhatsApp/email/address, social links, admin password change |

Logo upload karte hi header, footer, admin login sab jagah badal jaata hai. Brand colour badalne par poori site ka colour badal jaata hai.

## Local chalane ke liye
```bash
# 1) Backend
cd backend
cp .env.example .env      # values bharo
npm install
npm run dev               # http://localhost:5000

# 2) Frontend (naye terminal me)
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm install
npm run dev               # http://localhost:5173
```
Admin: `http://localhost:5173/admin/login` — email/password wahi jo `.env` me `ADMIN_EMAIL` / `ADMIN_PASSWORD` rakha hai.
Pehli successful login par admin database me save ho jaata hai; uske baad password **Site Settings** se badal sakte ho.

## Deploy

### 1) Backend → Render
1. GitHub par poora project push karo.
2. Render → New → **Blueprint** → repo select (ya New → Web Service, **Root Directory = `backend`**, Build `npm install`, Start `npm start`).
3. Environment variables (aapke purane Smart wale hi names chalte hain):

| Variable | Value |
|---|---|
| `MONGODB_URI` (ya `MONGO_URI`) | MongoDB Atlas connection string |
| `JWT_SECRET` | koi lambi random string |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | pehla admin login |
| `FRONTEND_URL` | Vercel site ka URL (comma se kai URL bhi de sakte ho) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | uploads ke liye |
| `PUBLIC_VERIFY_BASE_URL` | (optional) certificate QR ka link, default `FRONTEND_URL/verify-certificate` |

4. Deploy ke baad `https://<naam>.onrender.com/health` kholkar check karo — `{"status":"ok"}` aana chahiye.

### 2) Frontend → Vercel
1. Vercel → New Project → same repo → **Root Directory = `frontend`** (Framework: Vite, auto detect ho jaata hai).
2. Environment variable: `VITE_API_URL` = Render ka URL (jaise `https://smart-computers-backend.onrender.com`).
   (Purana `NEXT_PUBLIC_API_URL` pehle se set hai to wo bhi chalega.)
3. Deploy. `/admin/login` par jaakar login karo.

> Purane Next.js project ko replace kar rahe ho to usi Vercel project me Root Directory `frontend` set karke, Framework Preset **Vite** chun lo.

### Cloudinary (zaroori)
- Uploads (banner/reel/notice/certificate/logo) Cloudinary par jaate hain.
- PDF dikhane ke liye: Cloudinary → Settings → Security → **“Allow delivery of PDF and ZIP files”** ON karo.

### Backend bhi Vercel par chalana ho to
`backend/vercel.json` + `backend/api/index.js` taiyar hain (Root Directory = `backend`). Render par free plan me pehli request thodi slow ho sakti hai (server sota hai) — Vercel par ye problem nahi.

## CSV se certificates import
Columns: `certificateId,rollNumber,studentName,courseName,issueDate,grade,duration`
`certificateId` khali chhodo to auto ban jaata hai. `issueDate` format: `2025-11-20`.
