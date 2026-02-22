const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { studentGuard } = require('../middlewares/roleGuard');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

// Register with comprehensive validation
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Valid email required')
      .isLength({ max: 100 })
      .withMessage('Email must be less than 100 characters'),
    body('password')
      .isLength({ min: 6, max: 50 })
      .withMessage('Password must be between 6 and 50 characters')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Valid 10-digit phone number required'),
    body('role')
      .optional()
      .isIn(['student', 'owner', 'staff'])
      .withMessage('Invalid role'),
    body('university_id')
      .if(() => body('role').equals('student'))
      .notEmpty()
      .withMessage('University ID required for students')
      .isMongoId()
      .withMessage('Invalid university ID'),
    validate,
  ],
  register
);

// Login with validation
router.post(
  '/login',
  [
    body('email')
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Valid email required'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password required'),
    validate,
  ],
  login
);

// Get current user profile - protected
router.get('/me', protect, getMe);

// Update profile - protected
router.put(
  '/profile',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Valid 10-digit phone number required'),
    body('avatar')
      .optional()
      .trim()
      .isURL()
      .withMessage('Valid URL for avatar required'),
    validate,
  ],
  updateProfile
);

// Change password - protected
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword')
      .trim()
      .notEmpty()
      .withMessage('Current password required'),
    body('newPassword')
      .isLength({ min: 6, max: 50 })
      .withMessage('New password must be between 6 and 50 characters')
      .matches(/[a-z]/)
      .withMessage('New password must contain at least one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('New password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('New password must contain at least one number'),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Passwords do not match'),
    validate,
  ],
  changePassword
);

module.exports = router;
