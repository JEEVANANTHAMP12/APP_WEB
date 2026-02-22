const asyncHandler = require('express-async-handler');
const University = require('../models/University');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// @desc    Get all universities
// @route   GET /api/universities
// @access  Public
const getUniversities = asyncHandler(async (req, res) => {
  const { status = 'active', page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (status) query.status = status;

  const [universities, total] = await Promise.all([
    University.find(query).skip(skip).limit(parseInt(limit)).sort({ name: 1 }),
    University.countDocuments(query),
  ]);

  return paginatedResponse(res, universities, total, page, limit);
});

// @desc    Get single university
// @route   GET /api/universities/:id
// @access  Public
const getUniversity = asyncHandler(async (req, res) => {
  const university = await University.findById(req.params.id);
  if (!university) return errorResponse(res, 404, 'University not found');
  return successResponse(res, 200, 'University fetched', { university });
});

// @desc    Create university
// @route   POST /api/universities
// @access  Admin
const createUniversity = asyncHandler(async (req, res) => {
  const university = await University.create(req.body);
  return successResponse(res, 201, 'University created', { university });
});

// @desc    Update university
// @route   PUT /api/universities/:id
// @access  Admin
const updateUniversity = asyncHandler(async (req, res) => {
  const university = await University.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!university) return errorResponse(res, 404, 'University not found');
  return successResponse(res, 200, 'University updated', { university });
});

// @desc    Delete university
// @route   DELETE /api/universities/:id
// @access  Admin
const deleteUniversity = asyncHandler(async (req, res) => {
  const university = await University.findByIdAndDelete(req.params.id);
  if (!university) return errorResponse(res, 404, 'University not found');
  return successResponse(res, 200, 'University deleted');
});

module.exports = {
  getUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
};
