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

  if (!order_id) {
    return errorResponse(res, 400, 'Order ID is required');
  }

  const order = await Order.findById(order_id);
  if (!order) return errorResponse(res, 404, 'Order not found');

  if (order.user_id.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized to access this order');
  }

  if (order.payment_status === 'paid') {
    return errorResponse(res, 400, 'Order is already paid');
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

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
    return errorResponse(res, 400, 'Missing payment verification data');
  }

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return errorResponse(res, 400, 'Payment verification failed - signature mismatch');
  }

  // Get order and verify ownership
  const order = await Order.findById(order_id);
  if (!order) {
    return errorResponse(res, 404, 'Order not found');
  }

  if (order.user_id.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized');
  }

  // Update order with payment details
  order.payment_status = 'paid';
  order.razorpay_payment_id = razorpay_payment_id;
  order.order_status = 'confirmed';
  order.status_history.push({ status: 'confirmed', updated_by: req.user._id });
  await order.save();

  // Emit real-time notification to canteen
  try {
    const socketConfig = require('../config/socket');
    const io = socketConfig.getIO();
    io.to(`canteen_${order.canteen_id}`).emit('payment_confirmed', {
      order_id: order._id,
      order_number: order.order_number,
    });
  } catch (err) {
    console.error('Socket emission error:', err);
  }

  return successResponse(res, 200, 'Payment verified successfully', { order });
});

// @desc    Pay using wallet
// @route   POST /api/payment/wallet/pay
// @access  Student
const payWithWallet = asyncHandler(async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return errorResponse(res, 400, 'Order ID is required');
  }

  const order = await Order.findById(order_id);
  if (!order) return errorResponse(res, 404, 'Order not found');

  if (order.user_id.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized');
  }

  const user = await User.findById(req.user._id);
  if (user.wallet_balance < order.total_amount) {
    return errorResponse(
      res,
      400,
      `Insufficient wallet balance. Required: ₹${order.total_amount}, Available: ₹${user.wallet_balance}`
    );
  }

  // Deduct from wallet
  user.wallet_balance -= order.total_amount;
  await user.save();

  // Mark order as paid
  order.payment_status = 'paid';
  order.payment_method = 'wallet';
  order.order_status = 'confirmed';
  order.status_history.push({ status: 'confirmed', updated_by: req.user._id });
  await order.save();

  // Emit notification
  try {
    const socketConfig = require('../config/socket');
    const io = socketConfig.getIO();
    io.to(`canteen_${order.canteen_id}`).emit('payment_confirmed', {
      order_id: order._id,
      order_number: order.order_number,
    });
  } catch (err) {
    console.error('Socket emission error:', err);
  }

  return successResponse(res, 200, 'Payment successful via wallet', {
    order,
    wallet_balance: user.wallet_balance,
  });
});

// @desc    Wallet top-up (Razorpay)
// @route   POST /api/payment/wallet/topup
// @access  Student
const walletTopup = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount < 1) {
    return errorResponse(res, 400, 'Invalid amount. Minimum ₹1 required');
  }

  if (amount > 100000) {
    return errorResponse(res, 400, 'Maximum topup amount is ₹100,000');
  }

  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `wallet_${req.user._id}_${Date.now()}`,
    notes: {
      user_id: req.user._id.toString(),
      type: 'wallet_topup',
    },
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

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
    return errorResponse(res, 400, 'Missing wallet verification data');
  }

  if (amount < 1) {
    return errorResponse(res, 400, 'Invalid amount');
  }

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

  return successResponse(res, 200, 'Wallet credited successfully', {
    wallet_balance: user.wallet_balance,
    amount_added: amount,
    timestamp: new Date().toISOString(),
  });
});

// @desc    Get wallet balance
// @route   GET /api/payment/wallet/balance
// @access  Student
const getWalletBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('wallet_balance');

  return successResponse(res, 200, 'Wallet balance fetched', {
    wallet_balance: user.wallet_balance,
  });
});

// @desc    Refund order payment to wallet
// @route   POST /api/payment/refund/:orderId
// @access  Admin, Owner, Student (order owner)
const refundOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);

  if (!order) {
    return errorResponse(res, 404, 'Order not found');
  }

  // Check authorization
  const isOwner = order.user_id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isCanteenOwner = req.user.role === 'owner' && order.canteen_id === req.user.canteen_id;

  if (!isOwner && !isAdmin && !isCanteenOwner) {
    return errorResponse(res, 403, 'Not authorized to refund this order');
  }

  if (order.payment_status !== 'paid') {
    return errorResponse(res, 400, 'Cannot refund an unpaid order');
  }

  // Refund logic
  if (order.payment_method === 'wallet') {
    // Refund to wallet
    const user = await User.findByIdAndUpdate(
      order.user_id,
      { $inc: { wallet_balance: order.total_amount } },
      { new: true }
    );

    order.payment_status = 'refunded';
    order.order_status = 'cancelled';
    order.status_history.push({ status: 'cancelled', updated_by: req.user._id });
    await order.save();

    return successResponse(res, 200, 'Order refunded to wallet', {
      refund_amount: order.total_amount,
      wallet_balance: user.wallet_balance,
    });
  } else if (order.payment_method === 'online') {
    // For Razorpay, would need to process refund via Razorpay API
    order.payment_status = 'refund_initiated';
    await order.save();

    return successResponse(res, 200, 'Refund initiated. Will be processed in 5-7 business days', {
      refund_amount: order.total_amount,
      order_id: order._id,
    });
  }

  return errorResponse(res, 400, 'Cannot refund cash orders');
});

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  payWithWallet,
  walletTopup,
  verifyWalletTopup,
  getWalletBalance,
  refundOrder,
};
