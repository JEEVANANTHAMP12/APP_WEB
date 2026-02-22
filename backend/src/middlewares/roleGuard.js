const asyncHandler = require('express-async-handler');
const Canteen = require('../models/Canteen');
const { errorResponse } = require('../utils/apiResponse');

// Verify user is the owner of the canteen
const canteenOwnerGuard = asyncHandler(async (req, res, next) => {
  const { canteenId } = req.params || req.body;

  if (!canteenId) {
    return errorResponse(res, 400, 'Canteen ID is required');
  }

  // Only owners and admins can access canteen resources
  if (req.user.role === 'student') {
    return errorResponse(res, 403, 'Students cannot manage canteens');
  }

  // Check if user is the owner of the canteen
  if (req.user.role === 'owner') {
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return errorResponse(res, 404, 'Canteen not found');
    }

    if (canteen.owner_id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to modify this canteen');
    }
  }

  // Add canteen to request for downstream use
  req.canteenId = canteenId;
  next();
});

// Verify user is admin
const adminGuard = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Admin access required');
  }
  next();
};

// Verify user is owner
const ownerGuard = (req, res, next) => {
  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Owner/admin access required');
  }
  next();
};

// Verify user is student
const studentGuard = (req, res, next) => {
  if (req.user.role !== 'student') {
    return errorResponse(res, 403, 'Student access required');
  }
  next();
};

module.exports = {
  canteenOwnerGuard,
  adminGuard,
  ownerGuard,
  studentGuard,
};
