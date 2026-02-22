const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roleCheck');
const {
  getPlatformStats,
  getAllUsers,
  createAdminUser,
  updateAdminUser,
  toggleBlockUser,
  deleteUser,
  approveOwner,
  setCommission,
  getPendingCanteens,
  updateCanteenStatus,
  createAdminCanteen,
  deleteAdminCanteen,
  createAd,
  getAds,
  updateAd,
  deleteAd,
} = require('../controllers/adminController');

const admin = [protect, authorizeRoles('admin')];

router.get('/stats', ...admin, getPlatformStats);
router.get('/users', ...admin, getAllUsers);
router.post('/users', ...admin, createAdminUser);
router.put('/users/:id', ...admin, updateAdminUser);
router.patch('/users/:id/block', ...admin, toggleBlockUser);
router.delete('/users/:id', ...admin, deleteUser);
router.patch('/owners/:id/approve', ...admin, approveOwner);
router.patch('/canteens/:id/commission', ...admin, setCommission);
router.get('/canteens/pending', ...admin, getPendingCanteens);
router.post('/canteens', ...admin, createAdminCanteen);
router.patch('/canteens/:id/status', ...admin, updateCanteenStatus);
router.delete('/canteens/:id', ...admin, deleteAdminCanteen);
router.get('/ads', ...admin, getAds);
router.post('/ads', ...admin, createAd);
router.put('/ads/:id', ...admin, updateAd);
router.delete('/ads/:id', ...admin, deleteAd);

module.exports = router;
