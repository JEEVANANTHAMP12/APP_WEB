const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// @desc    Get menu items for a canteen
// @route   GET /api/menu?canteen_id=xxx
// @access  Public
const getMenuItems = asyncHandler(async (req, res) => {
  const { canteen_id, category, search, availability, page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (canteen_id) query.canteen_id = canteen_id;
  if (category) query.category = category;
  if (availability !== undefined) query.availability = availability === 'true';
  if (search) query.name = { $regex: search, $options: 'i' };

  const [items, total] = await Promise.all([
    MenuItem.find(query).skip(skip).limit(parseInt(limit)).sort({ category: 1, name: 1 }),
    MenuItem.countDocuments(query),
  ]);

  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return successResponse(res, 200, 'Menu fetched', { items, grouped, total });
});

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('canteen_id', 'name');
  if (!item) return errorResponse(res, 404, 'Item not found');
  return successResponse(res, 200, 'Item fetched', { item });
});

// @desc    Create menu item
// @route   POST /api/menu
// @access  Owner
const createMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.create({
    ...req.body,
    canteen_id: req.user.canteen_id,
  });
  return successResponse(res, 201, 'Menu item created', { item });
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Owner
const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOne({
    _id: req.params.id,
    canteen_id: req.user.canteen_id,
  });
  if (!item) return errorResponse(res, 404, 'Item not found or not authorized');

  Object.assign(item, req.body);
  await item.save();

  return successResponse(res, 200, 'Menu item updated', { item });
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Owner
const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOneAndDelete({
    _id: req.params.id,
    canteen_id: req.user.canteen_id,
  });
  if (!item) return errorResponse(res, 404, 'Item not found or not authorized');
  return successResponse(res, 200, 'Menu item deleted');
});

// @desc    Toggle availability
// @route   PATCH /api/menu/:id/toggle
// @access  Owner, Staff
const toggleAvailability = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return errorResponse(res, 404, 'Item not found');
  item.availability = !item.availability;
  await item.save();
  return successResponse(res, 200, `Item is now ${item.availability ? 'available' : 'unavailable'}`, { item });
});

// @desc    Get categories for a canteen
// @route   GET /api/menu/categories/:canteenId
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await MenuItem.distinct('category', {
    canteen_id: req.params.canteenId,
  });
  return successResponse(res, 200, 'Categories fetched', { categories });
});

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getCategories,
};
