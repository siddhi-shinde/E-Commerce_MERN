const express = require('express');
const router = express.Router();
const { addReview, getReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/addReview/:id', protect, authorizeRoles('customer'), addReview);
router.get('/getReviews/:id', getReviews);
router.put('/updateReview/:id/:reviewId', protect, authorizeRoles('customer'), updateReview);
router.delete('/deleteReview/:id/:reviewId', protect, deleteReview);

module.exports = router;
