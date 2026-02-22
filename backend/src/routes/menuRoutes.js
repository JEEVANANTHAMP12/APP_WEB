const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roleCheck');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getCategories,
} = require('../controllers/menuController');

router.get('/', getMenuItems);
router.get('/categories/:canteenId', getCategories);
router.get('/:id', getMenuItem);
router.post('/', protect, authorizeRoles('owner'), createMenuItem);
router.put('/:id', protect, authorizeRoles('owner'), updateMenuItem);
router.delete('/:id', protect, authorizeRoles('owner'), deleteMenuItem);
router.patch('/:id/toggle', protect, authorizeRoles('owner', 'staff'), toggleAvailability);

module.exports = router;
