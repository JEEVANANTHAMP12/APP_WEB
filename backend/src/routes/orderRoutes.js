const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { studentGuard, ownerGuard, adminGuard, canteenOwnerGuard } = require('../middlewares/roleGuard');
const {
  placeOrder,
  getMyOrders,
  getOrder,
  getCanteenOrders,
  updateOrderStatus,
  verifyOrderQR,
} = require('../controllers/orderController');

// Place order with validation
router.post(
  '/',
  protect,
  studentGuard,
  [
    body('canteen_id')
      .notEmpty()
      .withMessage('Canteen ID is required')
      .isMongoId()
      .withMessage('Invalid canteen ID'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.menu_item_id')
      .isMongoId()
      .withMessage('Invalid menu item ID'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('payment_method')
      .isIn(['online', 'wallet', 'cash_on_pickup'])
      .withMessage('Invalid payment method'),
    body('special_instructions')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Special instructions must be less than 500 characters'),
    validate,
  ],
  placeOrder
);

// Get user's orders
router.get('/my', protect, studentGuard, getMyOrders);

// Verify order by QR code
router.post(
  '/verify-qr',
  protect,
  ownerGuard,
  [
    body('qr_code')
      .notEmpty()
      .withMessage('QR code is required')
      .isString()
      .trim(),
    validate,
  ],
  verifyOrderQR
);

// Get canteen orders
router.get(
  '/canteen/:canteenId',
  protect,
  ownerGuard,
  [
    param('canteenId')
      .isMongoId()
      .withMessage('Invalid canteen ID'),
    validate,
  ],
  canteenOwnerGuard,
  getCanteenOrders
);

// Get single order
router.get(
  '/:id',
  protect,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
    validate,
  ],
  getOrder
);

// Update order status
router.patch(
  '/:id/status',
  protect,
  ownerGuard,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
    body('status')
      .isIn(['confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'])
      .withMessage('Invalid order status'),
    validate,
  ],
  updateOrderStatus
);

module.exports = router;
