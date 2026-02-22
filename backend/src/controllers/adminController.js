const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Canteen = require('../models/Canteen');
const Order = require('../models/Order');
const University = require('../models/University');
const Advertisement = require('../models/Advertisement');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// @desc    Get platform dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalStudents,
    totalOwners,
    totalCanteens,
    totalUniversities,
    totalOrders,
    revenueAgg,
    pendingOwners,
    pendingCanteens,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'owner' }),
    Canteen.countDocuments(),
    University.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$commission_amount' } } },
    ]),
    User.countDocuments({ role: 'owner', is_approved: false }),
    Canteen.countDocuments({ status: 'pending' }),
  ]);

  const last30Days = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$commission_amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return successResponse(res, 200, 'Stats fetched', {
    total_users: totalUsers,
    total_students: totalStudents,
    total_owners: totalOwners,
    total_canteens: totalCanteens,
    total_universities: totalUniversities,
    total_orders: totalOrders,
    platform_revenue: revenueAgg[0]?.total || 0,
    pending_approvals: pendingOwners + pendingCanteens,
    last_30_days: last30Days,
  });
});

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, is_active, page = 1, limit = 20, search } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (role) query.role = role;
  if (is_active !== undefined) query.is_active = is_active === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .populate('university_id', 'name')
      .populate('canteen_id', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  return paginatedResponse(res, users, total, page, limit);
});

// @desc    Admin create user
// @route   POST /api/admin/users
// @access  Admin
const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, university_id } = req.body;
  if (!name || !email || !password) return errorResponse(res, 400, 'Name, email and password are required');
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return errorResponse(res, 400, 'Email already registered');
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'student',
    phone: phone || '',
    ...(university_id && { university_id }),
    is_active: true,
    is_approved: true,
  });
  const safe = user.toObject();
  delete safe.password;
  return successResponse(res, 201, 'User created', { user: safe });
});

// @desc    Admin update user
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateAdminUser = asyncHandler(async (req, res) => {
  const { name, email, role, phone, university_id, is_active, password } = req.body;
  const update = { name, role, phone, is_active };
  if (email) update.email = email.toLowerCase();
  if (university_id !== undefined) update.university_id = university_id || null;
  if (password) update.password = await require('bcryptjs').hash(password, 10);
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate('university_id', 'name').populate('canteen_id', 'name');
  if (!user) return errorResponse(res, 404, 'User not found');
  return successResponse(res, 200, 'User updated', { user });
});

// @desc    Block / unblock user
// @route   PATCH /api/admin/users/:id/block
// @access  Admin
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 404, 'User not found');
  if (user.role === 'admin') return errorResponse(res, 400, 'Cannot block admin');

  user.is_active = !user.is_active;
  await user.save();

  return successResponse(res, 200, `User ${user.is_active ? 'unblocked' : 'blocked'}`, {
    user_id: user._id,
    is_active: user.is_active,
  });
});

// @desc    Approve canteen owner
// @route   PATCH /api/admin/owners/:id/approve
// @access  Admin
const approveOwner = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'owner') return errorResponse(res, 404, 'Owner not found');

  user.is_approved = true;
  await user.save();

  // Also approve the canteen
  await Canteen.findOneAndUpdate(
    { owner_id: user._id },
    { status: 'active' }
  );

  return successResponse(res, 200, 'Owner approved', { user_id: user._id });
});

// @desc    Set canteen commission
// @route   PATCH /api/admin/canteens/:id/commission
// @access  Admin
const setCommission = asyncHandler(async (req, res) => {
  const { commission_percentage } = req.body;
  const canteen = await Canteen.findByIdAndUpdate(
    req.params.id,
    { commission_percentage },
    { new: true }
  );
  if (!canteen) return errorResponse(res, 404, 'Canteen not found');
  return successResponse(res, 200, 'Commission updated', { canteen });
});

// @desc    Get canteens (filter by status)
// @route   GET /api/admin/canteens/pending?status=pending|active|suspended|all
// @access  Admin
const getPendingCanteens = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};
  const canteens = await Canteen.find(filter)
    .populate('owner_id', 'name email phone')
    .populate('university_id', 'name')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Canteens fetched', { canteens });
});

// @desc    Approve/Reject canteen
// @route   PATCH /api/admin/canteens/:id/status
// @access  Admin
const updateCanteenStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'active' or 'rejected'
  const canteen = await Canteen.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!canteen) return errorResponse(res, 404, 'Canteen not found');
  return successResponse(res, 200, `Canteen ${status}`, { canteen });
});

// @desc    Admin create canteen (bypass owner restriction, sets active directly)
// @route   POST /api/admin/canteens
// @access  Admin
const createAdminCanteen = asyncHandler(async (req, res) => {
  const { owner_id, university_id, name, description, phone, commission_percentage, opening_time, closing_time, status } = req.body;
  if (!university_id || !name) return errorResponse(res, 400, 'University and name are required');
  const canteen = await Canteen.create({
    university_id,
    owner_id: owner_id || req.user._id,
    name,
    description: description || '',
    phone: phone || '',
    commission_percentage: commission_percentage ?? 10,
    opening_time: opening_time || '08:00',
    closing_time: closing_time || '20:00',
    status: status || 'active',
  });
  if (owner_id) await User.findByIdAndUpdate(owner_id, { canteen_id: canteen._id });
  const populated = await Canteen.findById(canteen._id)
    .populate('university_id', 'name')
    .populate('owner_id', 'name email phone');
  return successResponse(res, 201, 'Canteen created', { canteen: populated });
});

// @desc    Admin delete canteen
// @route   DELETE /api/admin/canteens/:id
// @access  Admin
const deleteAdminCanteen = asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id);
  if (!canteen) return errorResponse(res, 404, 'Canteen not found');
  if (canteen.owner_id) await User.findByIdAndUpdate(canteen.owner_id, { $unset: { canteen_id: 1 } });
  await canteen.deleteOne();
  return successResponse(res, 200, 'Canteen deleted');
});

// @desc    Create Advertisement
// @route   POST /api/admin/ads
// @access  Admin
const createAd = asyncHandler(async (req, res) => {
  const ad = await Advertisement.create(req.body);
  return successResponse(res, 201, 'Advertisement created', { ad });
});

// @desc    Get all ads
// @route   GET /api/admin/ads
// @access  Admin
const getAds = asyncHandler(async (req, res) => {
  const ads = await Advertisement.find().sort({ createdAt: -1 });
  return successResponse(res, 200, 'Ads fetched', { ads });
});

// @desc    Update ad
// @route   PUT /api/admin/ads/:id
// @access  Admin
const updateAd = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ad) return errorResponse(res, 404, 'Ad not found');
  return successResponse(res, 200, 'Ad updated', { ad });
});

// @desc    Delete ad
// @route   DELETE /api/admin/ads/:id
// @access  Admin
const deleteAd = asyncHandler(async (req, res) => {
  await Advertisement.findByIdAndDelete(req.params.id);
  return successResponse(res, 200, 'Ad deleted');
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 404, 'User not found');
  if (user.role === 'admin') return errorResponse(res, 403, 'Cannot delete admin accounts');
  await user.deleteOne();
  return successResponse(res, 200, 'User deleted');
});

module.exports = {
  getPlatformStats,
  getAllUsers,
  createAdminUser,
  updateAdminUser,
  toggleBlockUser,
  approveOwner,
  setCommission,
  getPendingCanteens,
  updateCanteenStatus,
  createAdminCanteen,
  deleteAdminCanteen,
  createAd,
  getAds,
  updateAd,
  deleteAd,
  deleteUser,
};
