const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getDepartmentWiseRatings,
  getDoctorWiseRatings,
  getAiAnalytics
} = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getDashboardSummary);
router.get('/analytics', protect, getAiAnalytics);
router.get('/departments', protect, getDepartmentWiseRatings);
router.get('/doctors', protect, getDoctorWiseRatings);

module.exports = router;
