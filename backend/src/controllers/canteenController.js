const asyncHandler = require('express-async-handler');
const Canteen = require('../models/Canteen');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// @desc    Get canteens by university
// @route   GET /api/canteens?university_id=xxx
// @access  Public
const getCanteens = asyncHandler(async (req, res) => {
  const { university_id, status, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (university_id) query.university_id = university_id;
  if (status) query.status = status;
  else query.status = 'active';

  const [canteens, total] = await Promise.all([
    Canteen.find(query)
      .populate('university_id', 'name')
      .populate('owner_id', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1 }),
    Canteen.countDocuments(query),
  ]);

  return paginatedResponse(res, canteens, total, page, limit);
});

// @desc    Get single canteen
// @route   GET /api/canteens/:id
// @access  Public
const getCanteen = asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id)
    .populate('university_id', 'name location')
    .populate('owner_id', 'name email phone');
  if (!canteen) return errorResponse(res, 404, 'Canteen not found');
  return successResponse(res, 200, 'Canteen fetched', { canteen });
});

// @desc    Create canteen (owner registers canteen)
// @route   POST /api/canteens
// @access  Owner
const createCanteen = asyncHandler(async (req, res) => {
  const existing = await Canteen.findOne({ owner_id: req.user._id });
  if (existing) return errorResponse(res, 400, 'You already have a canteen');

  const canteen = await Canteen.create({
    ...req.body,
    owner_id: req.user._id,
    status: 'pending',
  });

  // Link canteen to owner
  await User.findByIdAndUpdate(req.user._id, { canteen_id: canteen._id });

  return successResponse(res, 201, 'Canteen created, pending admin approval', { canteen });
});

// @desc    Update canteen
// @route   PUT /api/canteens/:id
// @access  Owner, Admin
const updateCanteen = asyncHandler(async (req, res) => {
  const canteen = await Canteen.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!canteen) return errorResponse(res, 404, 'Canteen not found');
  return successResponse(res, 200, 'Canteen updated', { canteen });
});

// @desc    Toggle canteen open/close
// @route   PATCH /api/canteens/:id/toggle
// @access  Owner
const toggleCanteen = asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id);
  if (!canteen) return errorResponse(res, 404, 'Canteen not found');
  canteen.is_open = !canteen.is_open;
  await canteen.save();
  return successResponse(res, 200, `Canteen is now ${canteen.is_open ? 'open' : 'closed'}`, { canteen });
});

// @desc    Get canteen analytics
// @route   GET /api/canteens/:id/analytics
// @access  Owner, Admin
const getCanteenAnalytics = asyncHandler(async (req, res) => {
  const Order = require('../models/Order');
  const canteenId = req.params.id;

  const [totalOrders, revenueData, statusBreakdown] = await Promise.all([
    Order.countDocuments({ canteen_id: canteenId }),
    Order.aggregate([
      { $match: { canteen_id: require('mongoose').Types.ObjectId(canteenId), payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$net_amount' } } },
    ]),
    Order.aggregate([
      { $match: { canteen_id: require('mongoose').Types.ObjectId(canteenId) } },
      { $group: { _id: '$order_status', count: { $sum: 1 } } },
    ]),
  ]);

  const last7Days = await Order.aggregate([
    {
      $match: {
        canteen_id: require('mongoose').Types.ObjectId(canteenId),
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$total_amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return successResponse(res, 200, 'Analytics fetched', {
    total_orders: totalOrders,
    total_revenue: revenueData[0]?.total || 0,
    status_breakdown: statusBreakdown,
    last_7_days: last7Days,
  });
});

// @desc    Get staff members for a canteen
// @route   GET /api/canteens/:id/staff
// @access  Owner, Admin
const getCanteenStaff = asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id);
  if (!canteen) return errorResponse(res, 404, 'Canteen not found');

  // Owner can only view their own canteen's staff
  if (req.user.role === 'owner' && String(canteen.owner_id) !== String(req.user._id)) {
    return errorResponse(res, 403, 'Not authorized');
  }

  const staff = await User.find({ role: 'staff', canteen_id: req.params.id })
    .select('-password -refresh_token')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Staff fetched', { users: staff });
});

// @desc    Create a staff member for a canteen
// @route   POST /api/canteens/:id/staff
// @access  Owner, Admin
const createStaff = asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id);
  if (!canteen) return errorResponse(res, 404, 'Canteen not found');

  // Owner can only add staff to their own canteen
  if (req.user.role === 'owner' && String(canteen.owner_id) !== String(req.user._id)) {
    return errorResponse(res, 403, 'Not authorized');
  }

  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return errorResponse(res, 400, 'Name, email and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return errorResponse(res, 400, 'Email already registered');

  const bcrypt = require('bcryptjs');
  const hashed = await bcrypt.hash(password, 10);

  const { date_of_birth, hometown } = req.body;

  const staff = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    phone: phone || '',
    role: 'staff',
    canteen_id: canteen._id,
    university_id: canteen.university_id,
    date_of_birth: date_of_birth || null,
    hometown: hometown || '',
    is_active: true,
    is_approved: true,
  });

  return successResponse(res, 201, 'Staff account created', {
    user: {
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      canteen_id: staff.canteen_id,
      is_active: staff.is_active,
      is_blocked: staff.is_blocked,
    },
  });
});

// @desc    Update a staff member for a canteen
// @route   PUT /api/canteens/:id/staff/:staffId
// @access  Owner, Admin
const updateStaff = asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id);
  if (!canteen) return errorResponse(res, 404, 'Canteen not found');

  if (req.user.role === 'owner' && String(canteen.owner_id) !== String(req.user._id)) {
    return errorResponse(res, 403, 'Not authorized');
  }

  const staffMember = await User.findOne({ _id: req.params.staffId, role: 'staff', canteen_id: canteen._id });
  if (!staffMember) return errorResponse(res, 404, 'Staff member not found');

  const { name, phone, date_of_birth, hometown, password } = req.body;

  if (name) staffMember.name = name;
  if (phone !== undefined) staffMember.phone = phone;
  if (date_of_birth !== undefined) staffMember.date_of_birth = date_of_birth || null;
  if (hometown !== undefined) staffMember.hometown = hometown;
  if (password && password.trim().length >= 6) {
    const bcrypt = require('bcryptjs');
    staffMember.password = await bcrypt.hash(password, 10);
  }

  await staffMember.save();

  return successResponse(res, 200, 'Staff updated', {
    user: {
      _id: staffMember._id,
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      date_of_birth: staffMember.date_of_birth,
      hometown: staffMember.hometown,
      role: staffMember.role,
      canteen_id: staffMember.canteen_id,
      is_active: staffMember.is_active,
      is_blocked: staffMember.is_blocked,
    },
  });
});

module.exports = {
  getCanteens,
  getCanteen,
  createCanteen,
  updateCanteen,
  toggleCanteen,
  getCanteenAnalytics,
  getCanteenStaff,
  createStaff,
  updateStaff,
};
