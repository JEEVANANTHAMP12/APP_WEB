const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    if (!user.is_active) {
      return errorResponse(res, 403, 'Account has been blocked');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Not authorized, token failed');
  }
});

module.exports = { protect };
