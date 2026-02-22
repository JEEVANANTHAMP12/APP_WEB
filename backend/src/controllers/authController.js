const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateTokens = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendOtpEmail } = require('../utils/mail');

/* ─── In-memory OTP store  { email → { otp, expiresAt, name } } ─ */
const otpStore = new Map();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// @desc    Send OTP to email before registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  if (!email) return errorResponse(res, 400, 'Email is required');

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return errorResponse(res, 400, 'Email already registered');

  const otp = generateOtp();
  otpStore.set(email.toLowerCase().trim(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    name: name || 'there',
  });

  // Send email; fall back to console log in dev when SMTP is not configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await sendOtpEmail(email.toLowerCase().trim(), otp, name);
    } catch (err) {
      console.error('Mail send error:', err.message);
      return errorResponse(res, 500, 'Failed to send OTP email. Check SMTP config.');
    }
  } else {
    console.log(`[DEV] OTP for ${email}: ${otp}`);
  }

  return successResponse(res, 200, 'OTP sent to your email');
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email) return errorResponse(res, 400, 'Email is required');

  const key = email.toLowerCase().trim();
  const existing = await User.findOne({ email: key });
  if (existing) return errorResponse(res, 400, 'Email already registered');

  const otp = generateOtp();
  otpStore.set(key, { otp, expiresAt: Date.now() + OTP_TTL_MS, name: name || 'there' });

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try { await sendOtpEmail(key, otp, name); } catch (e) {
      return errorResponse(res, 500, 'Failed to send OTP email.');
    }
  } else {
    console.log(`[DEV] Resent OTP for ${key}: ${otp}`);
  }

  return successResponse(res, 200, 'OTP resent');
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, university_id, phone, otp } = req.body;

  const key = email?.toLowerCase().trim();

  // Verify OTP
  const record = otpStore.get(key);
  if (!record) return errorResponse(res, 400, 'No OTP was sent to this email. Please request one first.');
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return errorResponse(res, 400, 'OTP has expired. Please request a new one.');
  }
  if (record.otp !== String(otp).trim()) {
    return errorResponse(res, 400, 'Invalid OTP. Please try again.');
  }
  otpStore.delete(key);

  const existingUser = await User.findOne({ email: key });
  if (existingUser) return errorResponse(res, 400, 'Email already registered');

  const userData = { name, email: key, password, phone };

  if (role === 'student') {
    userData.role = 'student';
    userData.university_id = university_id;
  } else if (role === 'owner') {
    userData.role = 'owner';
    userData.is_approved = false;
  } else {
    userData.role = 'student';
  }

  const user = await User.create(userData);
  const { accessToken } = generateTokens(user._id);

  return successResponse(res, 201, 'Registration successful', {
    token: accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      university_id: user.university_id,
      wallet_balance: user.wallet_balance,
      is_approved: user.is_approved,
    },
  });
});


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return errorResponse(res, 401, 'Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return errorResponse(res, 401, 'Invalid credentials');
  }

  if (!user.is_active) {
    return errorResponse(res, 403, 'Account has been blocked. Contact admin.');
  }

  if (user.role === 'owner' && !user.is_approved) {
    return errorResponse(res, 403, 'Your account is pending admin approval.');
  }

  const { accessToken } = generateTokens(user._id);

  return successResponse(res, 200, 'Login successful', {
    token: accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      university_id: user.university_id,
      canteen_id: user.canteen_id,
      wallet_balance: user.wallet_balance,
      is_approved: user.is_approved,
      avatar: user.avatar,
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('university_id', 'name location')
    .populate('canteen_id', 'name status');

  return successResponse(res, 200, 'Profile fetched', { user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );

  return successResponse(res, 200, 'Profile updated', { user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(current_password);

  if (!isMatch) {
    return errorResponse(res, 400, 'Current password is incorrect');
  }

  user.password = new_password;
  await user.save();

  return successResponse(res, 200, 'Password changed successfully');
});

module.exports = { sendOtp, resendOtp, register, login, getMe, updateProfile, changePassword };
