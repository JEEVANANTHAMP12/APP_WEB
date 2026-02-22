const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { studentGuard, adminGuard } = require('../middlewares/roleGuard');
const {
  createRazorpayOrder,
  verifyPayment,
  payWithWallet,
  walletTopup,
  verifyWalletTopup,
  getWalletBalance,
  refundOrder,
} = require('../controllers/paymentController');

// Order payment endpoints
router.post('/create-order', protect, studentGuard, createRazorpayOrder);
router.post('/verify', protect, studentGuard, verifyPayment);

// Wallet endpoints
router.get('/wallet/balance', protect, studentGuard, getWalletBalance);
router.post('/wallet/pay', protect, studentGuard, payWithWallet);
router.post('/wallet/topup', protect, studentGuard, walletTopup);
router.post('/wallet/verify', protect, studentGuard, verifyWalletTopup);

// Refund endpoint
router.post('/refund/:orderId', protect, refundOrder);

module.exports = router;
