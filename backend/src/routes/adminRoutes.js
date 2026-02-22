const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roleCheck');
const {
  getPlatformStats,
  getAllUsers,
  toggleBlockUser,
  approveOwner,
  setCommission,
  getPendingCanteens,
  updateCanteenStatus,
  createAd,
  getAds,
  updateAd,
  deleteAd,
} = require('../controllers/adminController');

const admin = [protect, authorizeRoles('admin')];

router.get('/stats', ...admin, getPlatformStats);
router.get('/users', ...admin, getAllUsers);
router.patch('/users/:id/block', ...admin, toggleBlockUser);
router.patch('/owners/:id/approve', ...admin, approveOwner);
router.patch('/canteens/:id/commission', ...admin, setCommission);
router.get('/canteens/pending', ...admin, getPendingCanteens);
router.patch('/canteens/:id/status', ...admin, updateCanteenStatus);
router.get('/ads', ...admin, getAds);
router.post('/ads', ...admin, createAd);
router.put('/ads/:id', ...admin, updateAd);
router.delete('/ads/:id', ...admin, deleteAd);

module.exports = router;
