const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roleCheck');
const {
  getCanteens,
  getCanteen,
  createCanteen,
  updateCanteen,
  toggleCanteen,
  getCanteenAnalytics,
} = require('../controllers/canteenController');

router.get('/', getCanteens);
router.get('/:id', getCanteen);
router.post('/', protect, authorizeRoles('owner'), createCanteen);
router.put('/:id', protect, authorizeRoles('owner', 'admin'), updateCanteen);
router.patch('/:id/toggle', protect, authorizeRoles('owner'), toggleCanteen);
router.get('/:id/analytics', protect, authorizeRoles('owner', 'admin'), getCanteenAnalytics);

module.exports = router;
