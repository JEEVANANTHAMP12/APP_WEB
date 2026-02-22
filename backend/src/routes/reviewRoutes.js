const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/roleCheck');
const { addReview, getCanteenReviews } = require('../controllers/reviewController');

router.post('/', protect, authorizeRoles('student'), addReview);
router.get('/:canteenId', getCanteenReviews);

module.exports = router;
