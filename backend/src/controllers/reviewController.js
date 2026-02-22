const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Canteen = require('../models/Canteen');
const Order = require('../models/Order');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Add review
// @route   POST /api/reviews
// @access  Student
const addReview = asyncHandler(async (req, res) => {
  const { canteen_id, order_id, rating, comment } = req.body;

  // Verify order belongs to user and is completed
  const order = await Order.findOne({
    _id: order_id,
    user_id: req.user._id,
    order_status: 'picked_up',
  });
  if (!order) {
    return errorResponse(res, 400, 'Can only review completed orders');
  }

  const existing = await Review.findOne({ user_id: req.user._id, order_id });
  if (existing) return errorResponse(res, 400, 'Already reviewed this order');

  const review = await Review.create({
    user_id: req.user._id,
    canteen_id,
    order_id,
    rating,
    comment,
  });

  // Recalculate canteen rating
  const stats = await Review.aggregate([
    { $match: { canteen_id: new mongoose.Types.ObjectId(canteen_id) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Canteen.findByIdAndUpdate(canteen_id, {
      rating: Math.round(stats[0].avg * 10) / 10,
      total_reviews: stats[0].count,
    });
  }

  return successResponse(res, 201, 'Review added', { review });
});

// @desc    Get reviews for canteen
// @route   GET /api/reviews/:canteenId
// @access  Public
const getCanteenReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ canteen_id: req.params.canteenId })
    .populate('user_id', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50);

  return successResponse(res, 200, 'Reviews fetched', { reviews });
});

module.exports = { addReview, getCanteenReviews };
