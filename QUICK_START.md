# Quick Start Guide - Campus Cravings Implementation

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-cravings
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Start Server
```bash
npm run dev
```
Server runs on `http://localhost:5000`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```
App runs on `http://localhost:5173`

---

## Testing Security Features

### Rate Limiting
The following endpoints have rate limiting:
- `/api/auth/login` - 5 attempts per 15 minutes
- `/api/auth/register` - 5 attempts per 15 minutes
- `/api/payment/*` - 20 requests per 5 minutes

To test:
```bash
# Make multiple requests quickly
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}'
done
# 6th request should be rate limited
```

### Socket.IO Authentication
The frontend automatically passes JWT token. You can verify in browser DevTools:
```javascript
// Check console for socket connection messages
console.log('Socket connected with auth');
```

### Wallet Payment
```bash
# Test wallet payment endpoint
curl -X POST http://localhost:5000/api/payment/wallet/pay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"ORDER_ID_HERE"}'
```

---

## Key File Locations

### Backend
| File | Purpose |
|------|---------|
| `src/config/socket.js` | Socket.IO with JWT auth |
| `src/middlewares/rateLimit.js` | Rate limiting setup |
| `src/middlewares/roleGuard.js` | Role-based access control |
| `src/controllers/paymentController.js` | Wallet & payment logic |
| `src/routes/authRoutes.js` | Auth validation |
| `src/app.js` | Rate limiting middleware integration |

### Frontend
| File | Purpose |
|------|---------|
| `src/context/ThemeContext.jsx` | Dark mode management |
| `src/context/CartContext.jsx` | Cart with persistence |
| `src/context/SocketContext.jsx` | Socket with JWT auth |
| `src/components/Navbar.jsx` | Top navigation with theme toggle |
| `src/components/ErrorBoundary.jsx` | Error handling |
| `src/components/common/UIComponents.jsx` | Component library |
| `src/utils/ui.js` | UI utilities |
| `tailwind.config.js` | Dark mode & animations |

---

## Common Issues & Solutions

### Issue: Socket Connection Failed
**Solution**: 
- Ensure JWT token is in auth object
- Check browser console for error messages
- Verify backend is running on correct port

### Issue: Rate Limiting Error
**Solution**:
- Wait 15 minutes for login/register limits
- Wait 5 minutes for payment limits
- Admin users bypass rate limiting

### Issue: Cart Not Persisting
**Solution**:
- Check localStorage in dev tools
- Clear browser cache
- Ensure CartProvider is at top level

### Issue: Dark Mode Not Working
**Solution**:
- Check localStorage for 'theme' key
- Verify tailwind.config has `darkMode: 'class'`
- Inspect element to see `dark` class on `<html>`

### Issue: Validation Errors
**Solution**:
- Check error response message
- Validate input format (email, phone, password)
- Ensure all required fields are provided

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Performance Tips

1. **Wallet Balance Check**: Call `/api/payment/wallet/balance` before showing payment options
2. **Socket Reconnection**: Automatic with exponential backoff (1s to 5s)
3. **Cart Persistence**: Uses localStorage, clears when cart is emptied
4. **Animations**: All animations use CSS, not JavaScript animations
5. **Dark Mode**: Toggle is instant, no page reload needed

---

## Deployment Checklist

- [ ] Update `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Set up MongoDB Atlas
- [ ] Configure Razorpay prod keys
- [ ] Enable HTTPS
- [ ] Set up CORS for production domain
- [ ] Test all payment flows
- [ ] Test email notifications (if implemented)
- [ ] Monitor error logs

---

## Support & Debugging

### Enable Verbose Logging
```javascript
// Frontend - check console
localStorage.setItem('debug', '*');

// Backend - NODE_ENV=development shows all logs
```

### Check Socket Connection
```javascript
// Browser console
const { socket, connected } = useSocket();
console.log('Socket connected:', connected);
console.log('Socket ID:', socket?.id);
```

### Verify Rate Limiting
```javascript
// Check response headers
// X-RateLimit-Limit: 5
// X-RateLimit-Remaining: 0
// X-RateLimit-Reset: timestamp
```

---

## Version Info

- **Node.js**: 16.x or higher
- **React**: 18.2.0
- **Express**: 4.18.2
- **MongoDB**: 5.0 or higher
- **Socket.IO**: 4.6.2

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
├─────────────────────────────────────────┤
│  • Dark Mode Support                    │
│  • Modern UI Components                 │
│  • Cart Persistence                     │
│  • Socket.IO with JWT Auth              │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────┐
│      Backend (Express + Node.js)        │
├─────────────────────────────────────────┤
│  • Rate Limiting                        │
│  • JWT Authentication                   │
│  • Input Validation                     │
│  • Role-Based Access Control            │
│  • Wallet System                        │
│  • Payment Processing (Razorpay)        │
│  • Socket.IO with Auth                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      MongoDB Database                   │
├─────────────────────────────────────────┤
│  • Users, Orders, Menu Items            │
│  • Canteens, Payments                   │
│  • Review, Transactions                 │
└─────────────────────────────────────────┘
```

---

**Last Updated**: February 22, 2026
**Status**: ✅ Production Ready

