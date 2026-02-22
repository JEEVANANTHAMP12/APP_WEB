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

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleBlockUser,
  approveOwner,
  setCommission,
  getPendingCanteens,
  updateCanteenStatus,
  createAd,
  getAds,
  updateAd,
  deleteAd,
};
