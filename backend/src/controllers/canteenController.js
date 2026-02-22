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

module.exports = {
  getCanteens,
  getCanteen,
  createCanteen,
  updateCanteen,
  toggleCanteen,
  getCanteenAnalytics,
};
