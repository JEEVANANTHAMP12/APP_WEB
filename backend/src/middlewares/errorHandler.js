const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'An unexpected error occurred';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = `Invalid format for ${err.path}`;
    statusCode = 400;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `${field} "${value}" already exists. Please use a different value.`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.entries(err.errors).map(([field, error]) => ({
      field,
      message: error.message,
    }));
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid or malformed token. Please login again.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Your session has expired. Please login again.';
    statusCode = 401;
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'FILE_TOO_LARGE') {
      message = 'File size exceeds maximum limit (10MB)';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded';
    } else {
      message = 'File upload error: ' + err.message;
    }
    statusCode = 400;
  }

  // Race condition or concurrent request errors
  if (err.code === 'WrongVersionError') {
    message = 'Document was modified. Please refresh and try again.';
    statusCode = 409;
  }

  // Razorpay errors
  if (err.message?.includes('RAZORPAY') || err.message?.includes('payment')) {
    statusCode = 402; // Payment required
    message = 'Payment processing failed. Please try again.';
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error Details:', {
      name: err.name,
      message: err.message,
      statusCode,
      stack: err.stack,
    });
  }

  return errorResponse(res, statusCode, message);
};

module.exports = errorHandler;
