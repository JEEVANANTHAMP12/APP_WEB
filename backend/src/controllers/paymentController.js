const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Student
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { order_id } = req.body;

  const order = await Order.findById(order_id);
  if (!order) return errorResponse(res, 404, 'Order not found');

  if (order.user_id.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized');
  }

  const options = {
    amount: Math.round(order.total_amount * 100), // paise
    currency: 'INR',
    receipt: order.order_number,
    notes: {
      order_id: order._id.toString(),
      user_id: req.user._id.toString(),
    },
  };

  const razorpayOrder = await razorpay.orders.create(options);

  order.razorpay_order_id = razorpayOrder.id;
  await order.save();

  return successResponse(res, 200, 'Razorpay order created', {
    razorpay_order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
    order_number: order.order_number,
    user_name: req.user.name,
    user_email: req.user.email,
  });
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Student
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return errorResponse(res, 400, 'Payment verification failed');
  }

  // Mark order as paid
  const order = await Order.findByIdAndUpdate(
    order_id,
    {
      payment_status: 'paid',
      razorpay_payment_id,
      order_status: 'confirmed',
      $push: {
        status_history: { status: 'confirmed', updated_by: req.user._id },
      },
    },
    { new: true }
  );

  return successResponse(res, 200, 'Payment verified successfully', { order });
});

// @desc    Wallet top-up (Razorpay)
// @route   POST /api/payment/wallet/topup
// @access  Student
const walletTopup = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount < 1) return errorResponse(res, 400, 'Invalid amount');

  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `wallet_${req.user._id}_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  return successResponse(res, 200, 'Wallet order created', {
    razorpay_order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify wallet top-up
// @route   POST /api/payment/wallet/verify
// @access  Student
const verifyWalletTopup = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return errorResponse(res, 400, 'Wallet top-up verification failed');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { wallet_balance: amount } },
    { new: true }
  );

  return successResponse(res, 200, 'Wallet credited', {
    wallet_balance: user.wallet_balance,
  });
});

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  walletTopup,
  verifyWalletTopup,
};
