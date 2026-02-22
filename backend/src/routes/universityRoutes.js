const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roleCheck');
const {
  getUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} = require('../controllers/universityController');

router.get('/', getUniversities);
router.get('/:id', getUniversity);
router.post('/', protect, authorizeRoles('admin'), createUniversity);
router.put('/:id', protect, authorizeRoles('admin'), updateUniversity);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUniversity);

module.exports = router;
