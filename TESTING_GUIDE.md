# Testing Guide - Campus Cravings Platform

## Frontend Testing

### 1. Dark Mode Testing
```
✓ Click theme toggle button (☀️/🌙) in navbar
✓ Verify all components change colors
✓ Close browser and reopen - theme should persists
✓ Manual test: localStorage.getItem('theme') should be 'dark' or 'light'
```

### 2. Cart Persistence Testing
```
Steps:
1. Add items to cart
2. Refresh page (Ctrl+R)
3. Verify cart items still there
4. Open DevTools > Storage > localStorage
5. Check 'campus_cravings_cart' key contains items
6. Clear cart and verify localStorage is cleaned
```

### 3. Error Boundary Testing
```
Steps:
1. Navigate to any page
2. Intentionally cause an error (open DevTools console)
3. Try to cause rendering error (if possible)
4. Should see error page with recovery options
5. Click "Try Again" to recover
```

### 4. Socket.IO Connection Testing
```javascript
// In browser console:
const { socket, connected } = useSocket();
console.log('Socket ID:', socket?.id);
console.log('Connected:', connected);
console.log('User Room:', `user_${user._id}`);

// Should see connection logs in console
```

### 5. Input Validation Testing
```
Test Registration:
- Email without @: Show error
- Password < 6 chars: Show error
- Password without uppercase: Show error
- Password without number: Show error
- Phone not 10 digits: Show error
- All valid: Should register successfully

Test Login:
- Empty email: Show error
- Invalid email: Show error
- Empty password: Show error
```

### 6. UI Components Testing
```javascript
// Test each component:
// 1. Status Badge
<StatusBadge status="confirmed" />

// 2. Price Tag
<PriceTag price={150} label="per item" />

// 3. Loading Spinner
<LoadingSpinner size="md" />

// 4. Modal
<Modal isOpen={true} title="Test" onClose={() => {}}>Content</Modal>

// 5. Button
<Button variant="primary" loading={false}>Click me</Button>
```

---

## Backend Testing

### 1. Rate Limiting Testing

#### Login Rate Limit (5 attempts per 15 min)
```bash
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123"}'
  echo ""
  sleep 1
done
# Response on attempt 6 should be: "Too many login attempts"
```

#### Payment Rate Limit (20 per 5 min)
```bash
for i in {1..21}; do
  curl -X POST http://localhost:5000/api/payment/wallet/topup \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount":100}'
done
# Request 21 should be rate limited
```

### 2. Wallet Payment Testing

#### Step 1: Check Balance
```bash
curl -X GET http://localhost:5000/api/payment/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: { wallet_balance: 500 }
```

#### Step 2: Pay with Wallet
```bash
curl -X POST http://localhost:5000/api/payment/wallet/pay \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORDER_ID"
  }'
# Expected response:
# {
#   "success": true,
#   "message": "Payment successful via wallet",
#   "data": {
#     "order": {...},
#     "wallet_balance": 400
#   }
# }
```

#### Step 3: Test Insufficient Balance
```bash
# Create order for ₹10000 but wallet has only ₹500
curl -X POST http://localhost:5000/api/payment/wallet/pay \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "ORDER_ID"}'
# Expected: 400 error "Insufficient wallet balance"
```

### 3. Socket.IO Authentication Testing

#### Unauthorized Connection
```javascript
// Test in browser console - should fail
const socket = io('http://localhost:5000');
// Check console for connection error
```

#### Authorized Connection
```javascript
// Should succeed
const socket = io('http://localhost:5000', {
  auth: { token: userToken }
});
// Check socket.id in console
```

### 4. Order Validation Testing

#### Valid Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "canteen_id": "CANTEEN_ID",
    "items": [
      {
        "menu_item_id": "ITEM_ID",
        "quantity": 2
      }
    ],
    "payment_method": "wallet",
    "special_instructions": "No onions"
  }'
# Should succeed with 201 Created
```

#### Invalid Order (Missing item)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "canteen_id": "CANTEEN_ID",
    "items": [],
    "payment_method": "wallet"
  }'
# Should fail: "At least one item is required"
```

#### Invalid Item ID
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "canteen_id": "CANTEEN_ID",
    "items": [
      {
        "menu_item_id": "INVALID_ID",
        "quantity": 1
      }
    ],
    "payment_method": "wallet"
  }'
# Should fail: "Invalid menu item ID"
```

### 5. Authorization Testing

#### Canteen Owner Guard
```bash
# Try to access another canteen's data
curl -X GET http://localhost:5000/api/orders/canteen/OTHER_CANTEEN_ID \
  -H "Authorization: Bearer OWNER_TOKEN_FOR_DIFFERENT_CANTEEN"
# Should fail: "Not authorized to modify this canteen"
```

#### Student Cannot Edit Orders
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
# Should fail: "Owner/admin access required"
```

### 6. Input Validation Testing

#### Password Validation
```bash
# Too short
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Abc1"
  }'
# Error: "Password must be between 6 and 50 characters"

# Missing uppercase
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "abc123"
  }'
# Error: "must contain at least one uppercase letter"
```

#### Email Validation
```bash
# Invalid email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "password": "Abc123"
  }'
# Error: "Valid email required"
```

---

## Integration Testing

### Complete User Flow

#### 1. Registration
```bash
POST /api/auth/register
{
  "name": "Alice Study",
  "email": "alice@university.edu",
  "password": "StudyPass123!",
  "phone": "9876543210",
  "role": "student",
  "university_id": "UNI_001"
}
# Success: Get JWT token
```

#### 2. Login
```bash
POST /api/auth/login
{
  "email": "alice@university.edu",
  "password": "StudyPass123!"
}
# Success: Get JWT token and user data
```

#### 3. Browse Canteens
```bash
GET /api/canteens?university_id=UNI_001
Header: Authorization: Bearer JWT_TOKEN
# Success: Get list of canteens
```

#### 4. View Menu Items
```bash
GET /api/menu?canteen_id=CANTEEN_001
Header: Authorization: Bearer JWT_TOKEN
# Success: Get menu items
```

#### 5. Place Order
```bash
POST /api/orders
Header: Authorization: Bearer JWT_TOKEN
{
  "canteen_id": "CANTEEN_001",
  "items": [
    {"menu_item_id": "ITEM_001", "quantity": 2},
    {"menu_item_id": "ITEM_002", "quantity": 1}
  ],
  "payment_method": "wallet"
}
# Success: Order created with status "placed"
```

#### 6. Pay with Wallet
```bash
POST /api/payment/wallet/pay
Header: Authorization: Bearer JWT_TOKEN
{
  "order_id": "ORDER_001"
}
# Success: Order status changes to "confirmed", wallet balance updated
```

#### 7. Real-time Notification
```javascript
// Frontend should receive update via Socket
socket.on('order_status_update', (data) => {
  console.log('Order updated:', data);
});
```

#### 8. Refund Order
```bash
POST /api/payment/refund/ORDER_001
Header: Authorization: Bearer JWT_TOKEN
# Success: Order marked as refunded, wallet credited
```

---

## Performance Testing

### 1. Load Testing
```bash
# Test with 100 concurrent requests
ab -n 100 -c 10 http://localhost:5000/api/health
# should handle without errors
```

### 2. Animation Performance
```
- Monitor DevTools Performance tab
- Check FPS on theme toggle
- Verify animations are 60fps
- Check no jank on transitions
```

### 3. Network Performance
```
- DevTools Network tab in dark mode toggle
- No large JS transfers
- Socket.IO messages compressed
- API responses < 1s
```

---

## Security Testing

### 1. XSS Prevention
```javascript
// Try injecting HTML in input
email: "<script>alert('XSS')</script>"
// Should be escaped/rejected by validation
```

### 2. SQL Injection Prevention
```bash
# Try MongoDB injection
order_id: '{"$ne": null}'
# Should be properly validated and rejected
```

### 3. CSRF Prevention
```
- Verify Authorization header required
- Cookies not used for auth (JWT only)
- POST requests require token
```

### 4. Token Expiry
```javascript
// Manually set past expiry in token
// Try API request
// Should get 401 "Token expired"
```

---

## Checklist

### Before Deployment
- [ ] All rate limits working
- [ ] Socket.IO auth required
- [ ] Input validation on all routes
- [ ] Error messages user-friendly
- [ ] Dark mode tested on Safari/Firefox
- [ ] Cart persistence works
- [ ] Wallet payment tested end-to-end
- [ ] Refund flow working
- [ ] No console errors
- [ ] Performance metrics good
- [ ] Security tests passed
- [ ] Mobile responsive tested
- [ ] Error boundary catches errors
- [ ] All animations smooth

---

**Last Updated**: February 22, 2026  
**Test Coverage**: ✅ Comprehensive

