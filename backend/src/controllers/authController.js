const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateTokens = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, university_id, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 400, 'Email already registered');
  }

  const userData = { name, email, password, phone };

  if (role === 'student') {
    userData.role = 'student';
    userData.university_id = university_id;
  } else if (role === 'owner') {
    userData.role = 'owner';
    userData.is_approved = false; // pending admin approval
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

module.exports = { register, login, getMe, updateProfile, changePassword };
