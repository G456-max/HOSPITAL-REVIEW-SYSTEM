const express = require('express');
const router = express.Router();
const {
  submitReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getNotifications,
  resolveNotification,
  generateSuggestions
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/auth');

// Public submit
router.post('/', submitReview);
router.post('/generate-comments', generateSuggestions);

// Scoped reviews CRUD
router.get('/', protect, getReviews);
router.get('/:id', protect, getReviewById);
router.put('/:id', protect, authorize('SuperAdmin'), updateReview);
router.delete('/:id', protect, authorize('SuperAdmin'), deleteReview);

// Notification Alert warnings
router.get('/alerts/all', protect, getNotifications);
router.put('/alerts/:id/resolve', protect, resolveNotification);

module.exports = router;
