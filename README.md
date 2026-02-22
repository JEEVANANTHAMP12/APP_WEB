# 🍽️ UniCanteen — Multi-University Campus Food Ordering Platform

A full-stack food ordering platform for college campuses, similar to Zomato/Swiggy but built for universities. Supports multiple universities, multiple canteens per campus, real-time order tracking, Razorpay payments, a wallet system, and 4 user roles.

---

## 📦 Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React 18 + Vite 5, Tailwind CSS 3, React Router 6   |
| Backend    | Node.js 20, Express 4, MongoDB + Mongoose 8         |
| Real-time  | Socket.io 4                                         |
| Payments   | Razorpay (orders + wallet top-up)                   |
| Auth       | JWT (access token, 7d expiry) + bcryptjs            |
| Charts     | Chart.js 4 + react-chartjs-2                        |

---

## 👤 User Roles

| Role    | Access                                                     |
|---------|------------------------------------------------------------|
| Student | Browse canteens, order food, wallet, live order tracking   |
| Owner   | Manage menu, view live orders, earnings, staff, QR verify  |
| Staff   | Live orders, QR verify (same panel as owner)               |
| Admin   | Platform stats, user management, canteen approvals, ads    |

---

## 🗂️ Project Structure

```
WEB/
├── backend/
│   ├── server.js                 # Entry point
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js                # Express app + routes
│       ├── config/
│       │   ├── db.js             # MongoDB connection
│       │   └── socket.js         # Socket.io singleton
│       ├── models/               # Mongoose schemas
│       ├── controllers/          # Route handlers
│       ├── routes/               # Express routers
│       ├── middlewares/          # auth, roleCheck, validate, errorHandler
│       └── utils/                # generateToken, apiResponse
└── frontend/
    ├── index.html
    ├── vite.config.js            # Proxies /api → localhost:5000
    ├── tailwind.config.js
    └── src/
        ├── App.jsx               # Route tree
        ├── main.jsx
        ├── index.css             # Tailwind + component classes
        ├── services/api.js       # All API modules (axios)
        ├── context/              # AuthContext, CartContext, SocketContext
        ├── components/common/    # PrivateRoute, Loading, StatusBadge
        ├── layouts/              # StudentLayout, OwnerLayout, AdminLayout
        └── pages/
            ├── auth/             # LoginPage, RegisterPage
            ├── student/          # 9 pages (Home → Wallet)
            ├── owner/            # 7 pages (Dashboard → QRVerify)
            └── admin/            # 5 pages (Dashboard → Ads)
```

---

## 🚀 Local Development Setup

### 1. Clone & install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/unicanteen
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend needs this for Razorpay checkout
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Create `frontend/.env`:

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 3. Run the app

```bash
# Terminal 1 — Backend
cd backend
npm run dev      # uses nodemon

# Terminal 2 — Frontend
cd frontend
npm run dev      # Vite dev server at http://localhost:5173
```

### 4. Create the first admin user

Use MongoDB shell or Compass to manually set a user's role to `admin`:

```js
// MongoDB shell
use unicanteen
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Or register normally and patch the DB. After that, the admin can log in at `/login` and access `/admin`.

---

## 🔑 API Overview

All endpoints are prefixed with `/api`.

| Prefix          | Description                         |
|-----------------|-------------------------------------|
| `/api/auth`     | Register, login, profile            |
| `/api/universities` | CRUD universities               |
| `/api/canteens` | CRUD canteens, toggle open/close    |
| `/api/menu`     | Menu items CRUD, toggle availability|
| `/api/orders`   | Place orders, update status, QR     |
| `/api/payment`  | Razorpay order create + verify      |
| `/api/reviews`  | Add & list canteen reviews          |
| `/api/admin`    | Stats, users, canteen approvals, ads|

---

## 🔌 Real-time Events (Socket.io)

| Event                | Emitted by    | Received by         | Description                        |
|----------------------|---------------|---------------------|------------------------------------|
| `new_order`          | Server        | `canteen_{id}` room | Owner notified of incoming order   |
| `order_status_update`| Server        | `user_{id}` + `canteen_{id}` | Status changes in real-time |

**Room joining logic (frontend `SocketContext`):**
- Student → joins `user_{userId}`
- Owner / Staff → joins `canteen_{canteenId}`

---

## 💳 Payment Flow

### Online Payment (Razorpay)
1. Student places order → backend creates Razorpay order → returns `razorpay_order_id`
2. Frontend opens Razorpay checkout modal
3. On success → `POST /api/payment/verify` with signature → order marked `paid`

### Cash on Pickup
- Order placed directly, `payment_status: pending`, paid on collection

### Wallet Top-up
1. `POST /api/payment/wallet/create-order` → Razorpay order
2. On success → `POST /api/payment/wallet/verify` → wallet credited

---

## 📊 Commission System

- Admin sets commission percentage per canteen (`/admin/canteens`)
- On each order: `commission_amount = total_amount × (commission_percentage / 100)`
- `net_amount = total_amount - commission_amount`
- Both stored on the `Order` document for accounting

---

## 🌐 Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set **Root Directory** to `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Set environment variables in Render dashboard (same as `.env`)

### Frontend → Vercel

1. Import project on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Add environment variables:
   - `VITE_SOCKET_URL` = your Render backend URL (e.g. `https://unicanteen-api.onrender.com`)
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay test/live key
5. Deploy

> **Important:** Update `vite.config.js` proxy target to your live backend URL for production builds, or use `VITE_API_BASE_URL` env var in `api.js`.

### MongoDB → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist `0.0.0.0/0` (or Render's IP) in Network Access
3. Copy the connection string to `MONGO_URI` env var

---

## 🔧 Available Scripts

### Backend
| Command         | Description                    |
|-----------------|--------------------------------|
| `npm start`     | Production start (`node server.js`) |
| `npm run dev`   | Dev with nodemon               |

### Frontend
| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Vite dev server (port 5173)    |
| `npm run build` | Production build to `dist/`    |
| `npm run preview` | Preview production build     |

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| CORS error in dev | Ensure backend `PORT=5000` and Vite proxy is set to `http://localhost:5000` |
| Socket not connecting | Set `VITE_SOCKET_URL` in `frontend/.env` |
| Razorpay script not loading | Check internet connection; script is lazy-loaded at checkout |
| Owner not seeing canteen data | Admin must approve the owner account first via `/admin/canteens` |
| JWT 401 on refresh | Token expired (7d); log in again. Implement refresh tokens for production |

---

## 📄 License

MIT — free to use, modify, and deploy.
