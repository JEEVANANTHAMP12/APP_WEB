const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roleCheck');
const {
  placeOrder,
  getMyOrders,
  getOrder,
  getCanteenOrders,
  updateOrderStatus,
  verifyOrderQR,
} = require('../controllers/orderController');

router.post('/', protect, authorizeRoles('student'), placeOrder);
router.get('/my', protect, authorizeRoles('student'), getMyOrders);
router.post('/verify-qr', protect, authorizeRoles('staff', 'owner'), verifyOrderQR);
router.get('/canteen/:canteenId', protect, authorizeRoles('owner', 'staff', 'admin'), getCanteenOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, authorizeRoles('owner', 'staff', 'admin'), updateOrderStatus);

module.exports = router;
