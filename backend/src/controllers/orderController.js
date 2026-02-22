const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Canteen = require('../models/Canteen');
const MenuItem = require('../models/MenuItem');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const socketConfig = require('../config/socket');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Student
const placeOrder = asyncHandler(async (req, res) => {
  const { canteen_id, items, payment_method, special_instructions } = req.body;

  const canteen = await Canteen.findById(canteen_id);
  if (!canteen || canteen.status !== 'active') {
    return errorResponse(res, 400, 'Canteen is not available');
  }

  // Ensure student belongs to the same university as the canteen
  const studentUniId = req.user.university_id?.toString();
  const canteenUniId = canteen.university_id?.toString();
  if (studentUniId && canteenUniId && studentUniId !== canteenUniId) {
    return errorResponse(res, 403, 'You can only order from canteens at your university');
  }

  // Validate & calculate total
  let total_amount = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menu_item_id);
    if (!menuItem || !menuItem.availability) {
      return errorResponse(res, 400, `Item ${item.menu_item_id} is not available`);
    }
    const itemTotal = menuItem.price * item.quantity;
    total_amount += itemTotal;
    orderItems.push({
      menu_item_id: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      image: menuItem.image,
    });
  }

  const commission_amount = (total_amount * canteen.commission_percentage) / 100;
  const net_amount = total_amount - commission_amount;

  const order = await Order.create({
    user_id: req.user._id,
    canteen_id,
    items: orderItems,
    total_amount,
    commission_amount,
    net_amount,
    payment_method,
    special_instructions,
    payment_status: payment_method === 'cash_on_pickup' ? 'pending' : 'pending',
    status_history: [{ status: 'placed', updated_by: req.user._id }],
  });

  // Emit real-time to canteen room
  try {
    const io = socketConfig.getIO();
    io.to(`canteen_${canteen_id}`).emit('new_order', {
      order_id: order._id,
      order_number: order.order_number,
      user_id: req.user._id,
      total_amount: order.total_amount,
      items: order.items,
      payment_method,
    });
  } catch (_) {}

  return successResponse(res, 201, 'Order placed successfully', { order });
});

// @desc    Get orders for current student
// @route   GET /api/orders/my
// @access  Student
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  const query = { user_id: req.user._id };
  if (status) query.order_status = status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('canteen_id', 'name image')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Order.countDocuments(query),
  ]);

  return paginatedResponse(res, orders, total, page, limit);
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user_id', 'name email phone')
    .populate('canteen_id', 'name phone')
    .populate('items.menu_item_id', 'name image');

  if (!order) return errorResponse(res, 404, 'Order not found');

  // Students can only see their own orders
  if (
    req.user.role === 'student' &&
    order.user_id._id.toString() !== req.user._id.toString()
  ) {
    return errorResponse(res, 403, 'Not authorized');
  }

  return successResponse(res, 200, 'Order fetched', { order });
});

// @desc    Get orders for a canteen (owner/staff)
// @route   GET /api/orders/canteen/:canteenId
// @access  Owner, Staff
const getCanteenOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, date } = req.query;
  const skip = (page - 1) * limit;

  const query = { canteen_id: req.params.canteenId };
  if (status) query.order_status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    query.createdAt = { $gte: start, $lt: end };
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user_id', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Order.countDocuments(query),
  ]);

  return paginatedResponse(res, orders, total, page, limit);
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Owner, Staff
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validTransitions = {
    placed: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready'],
    ready: ['picked_up'],
  };

  const order = await Order.findById(req.params.id);
  if (!order) return errorResponse(res, 404, 'Order not found');

  // Staff can only update orders from their own canteen
  if (req.user.role === 'staff') {
    const staffCanteenId = req.user.canteen_id?.toString();
    if (staffCanteenId && order.canteen_id.toString() !== staffCanteenId) {
      return errorResponse(res, 403, 'This order does not belong to your canteen');
    }
  }

  const allowed = validTransitions[order.order_status];
  if (!allowed || !allowed.includes(status)) {
    return errorResponse(res, 400, `Cannot transition from ${order.order_status} to ${status}`);
  }

  order.order_status = status;
  order.status_history.push({ status, updated_by: req.user._id });

  if (status === 'cancelled' && order.payment_status === 'paid') {
    order.payment_status = 'refunded';
  }

  await order.save();

  // Emit real-time to student
  try {
    const io = socketConfig.getIO();
    io.to(`user_${order.user_id}`).emit('order_status_update', {
      order_id: order._id,
      order_number: order.order_number,
      order_status: order.order_status,
      updated_at: new Date(),
    });
    // Also notify canteen room
    io.to(`canteen_${order.canteen_id}`).emit('order_status_update', {
      order_id: order._id,
      order_number: order.order_number,
      order_status: order.order_status,
    });
  } catch (_) {}

  return successResponse(res, 200, 'Order status updated', { order });
});

// @desc    Verify order by QR code
// @route   POST /api/orders/verify-qr
// @access  Staff
const verifyOrderQR = asyncHandler(async (req, res) => {
  const { qr_code } = req.body;

  const order = await Order.findOne({ qr_code })
    .populate('user_id', 'name')
    .populate('items.menu_item_id', 'name');

  if (!order) return errorResponse(res, 404, 'Invalid QR code');
  if (order.order_status !== 'ready') {
    return errorResponse(res, 400, `Order status is: ${order.order_status}, not ready for pickup`);
  }

  // Staff can only verify orders from their own canteen
  if (req.user.role === 'staff') {
    const staffCanteenId = req.user.canteen_id?.toString();
    if (staffCanteenId && order.canteen_id.toString() !== staffCanteenId) {
      return errorResponse(res, 403, 'This order does not belong to your canteen');
    }
  }

  return successResponse(res, 200, 'QR verified', {
    order_id: order._id,
    order_number: order.order_number,
    user_name: order.user_id.name,
    items: order.items,
    total_amount: order.total_amount,
  });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrder,
  getCanteenOrders,
  updateOrderStatus,
  verifyOrderQR,
};
