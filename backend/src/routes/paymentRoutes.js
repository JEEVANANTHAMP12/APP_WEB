const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roleCheck');
const {
  createRazorpayOrder,
  verifyPayment,
  walletTopup,
  verifyWalletTopup,
} = require('../controllers/paymentController');

router.post('/create-order', protect, authorizeRoles('student'), createRazorpayOrder);
router.post('/verify', protect, authorizeRoles('student'), verifyPayment);
router.post('/wallet/topup', protect, authorizeRoles('student'), walletTopup);
router.post('/wallet/verify', protect, authorizeRoles('student'), verifyWalletTopup);

module.exports = router;
