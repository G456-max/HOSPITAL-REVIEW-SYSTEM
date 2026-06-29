const Review = require('../models/Review');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

/**
 * @desc    Get dashboard counts, average ratings, and sentiment breakdown
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const query = {};
    
    // Scoped department mapping
    if (req.user && req.user.role === 'DepartmentAdmin') {
      query.department = req.user.department;
    }

    if (req.query.patientType) {
      query.patientType = req.query.patientType;
    }

    const totalReviews = await Review.countDocuments(query);

    // Calculate dates
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeekly = new Date();
    startOfWeekly.setDate(startOfWeekly.getDate() - 7);

    const startOfMonthly = new Date();
    startOfMonthly.setDate(startOfMonthly.getDate() - 30);

    const todayReviews = await Review.countDocuments({ ...query, reviewDate: { $gte: startOfToday } });
    const weeklyReviews = await Review.countDocuments({ ...query, reviewDate: { $gte: startOfWeekly } });
    const monthlyReviews = await Review.countDocuments({ ...query, reviewDate: { $gte: startOfMonthly } });

    // Sentiment breakdown
    const positiveCount = await Review.countDocuments({ ...query, sentiment: 'Positive' });
    const negativeCount = await Review.countDocuments({ ...query, sentiment: 'Negative' });
    const mixedCount = await Review.countDocuments({ ...query, sentiment: 'Mixed' });

    // Calculate overall average
    let averageRating = 0;
    if (totalReviews > 0) {
      const avgAggregate = await Review.aggregate([
        { $match: query },
        { $group: { _id: null, avgScore: { $avg: '$overallRating' } } }
      ]);
      averageRating = avgAggregate[0]?.avgScore || 0;
    }

    // Percentages
    const positivePercent = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
    const negativePercent = totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0;
    const neutralPercent = totalReviews > 0 ? Math.round((mixedCount / totalReviews) * 100) : 0;

    res.json({
      totalReviews,
      todayReviews,
      weeklyReviews,
      monthlyReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      sentiment: {
        positive: positiveCount,
        negative: negativeCount,
        mixed: mixedCount,
        positivePercent,
        negativePercent,
        neutralPercent
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ratings breakdown and counts per department
 * @route   GET /api/dashboard/departments
 * @access  Private
 */
const getDepartmentWiseRatings = async (req, res, next) => {
  try {
    const query = {};
    if (req.user && req.user.role === 'DepartmentAdmin') {
      query.department = req.user.department;
    }

    if (req.query.patientType) {
      query.patientType = req.query.patientType;
    }

    const deptStats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$department',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$overallRating' },
          positiveSentiment: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
          negativeSentiment: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } },
          avgRegistration: { $avg: '$ratings.registrationProcess' },
          avgDoctor: { $avg: '$ratings.doctorConfidence' },
          avgNurses: { $avg: '$ratings.nursesOverallSupport' },
          avgHousekeeping: { $avg: '$ratings.overallHygiene' },
          avgLab: { $avg: '$ratings.reportDeliveryLab' },
          avgPharmacy: { $avg: '$ratings.medicineAvailability' },
          avgFood: { $avg: '$ratings.foodQuality' },
          avgBilling: { $avg: '$ratings.billingOverallSatisfaction' },
          avgExperience: { $avg: '$ratings.hospitalOverallExperience' }
        }
      },
      { $sort: { averageRating: -1 } }
    ]);

    // Map stats with alerts resolved status
    const result = await Promise.all(
      deptStats.map(async (d) => {
        const hasWarning = await Notification.findOne({
          department: d._id,
          resolved: false
        });

        const total = d.totalReviews;
        return {
          departmentName: d._id,
          totalReviews: total,
          averageRating: Math.round(d.averageRating * 10) / 10,
          positivePercent: total > 0 ? Math.round((d.positiveSentiment / total) * 100) : 0,
          negativePercent: total > 0 ? Math.round((d.negativeSentiment / total) * 100) : 0,
          activeWarning: !!hasWarning,
          categoryAverages: {
            registration: Math.round(d.avgRegistration * 10) / 10,
            doctors: Math.round(d.avgDoctor * 10) / 10,
            nurses: Math.round(d.avgNurses * 10) / 10,
            housekeeping: Math.round(d.avgHousekeeping * 10) / 10,
            lab: Math.round(d.avgLab * 10) / 10,
            pharmacy: Math.round(d.avgPharmacy * 10) / 10,
            food: Math.round(d.avgFood * 10) / 10,
            billing: Math.round(d.avgBilling * 10) / 10,
            experience: Math.round(d.avgExperience * 10) / 10
          }
        };
      })
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ratings breakdown and counts per doctor
 * @route   GET /api/dashboard/doctors
 * @access  Private
 */
const getDoctorWiseRatings = async (req, res, next) => {
  try {
    const query = {};
    if (req.user && req.user.role === 'DepartmentAdmin') {
      query.department = req.user.department;
    }

    if (req.query.patientType) {
      query.patientType = req.query.patientType;
    }

    const doctorStats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: { doctor: '$doctorName', department: '$department' },
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$overallRating' },
          positiveSentiment: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
          negativeSentiment: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } }
        }
      },
      { $sort: { averageRating: -1 } }
    ]);

    const result = doctorStats.map((d) => {
      const total = d.totalReviews;
      return {
        doctorName: d._id.doctor,
        department: d._id.department,
        totalReviews: total,
        averageRating: Math.round(d.averageRating * 10) / 10,
        positivePercent: total > 0 ? Math.round((d.positiveSentiment / total) * 100) : 0,
        negativePercent: total > 0 ? Math.round((d.negativeSentiment / total) * 100) : 0
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI-generated analytics, rankings, trends, and monthly summaries
 * @route   GET /api/dashboard/analytics
 * @access  Private
 */
const getAiAnalytics = async (req, res, next) => {
  try {
    const query = {};
    if (req.user && req.user.role === 'DepartmentAdmin') {
      query.department = req.user.department;
    }

    if (req.query.patientType) {
      query.patientType = req.query.patientType;
    }

    // 1. Fetch Urgency Levels
    const lowUrgency = await Review.countDocuments({ ...query, urgencyLevel: 'Low' });
    const mediumUrgency = await Review.countDocuments({ ...query, urgencyLevel: 'Medium' });
    const highUrgency = await Review.countDocuments({ ...query, urgencyLevel: 'High' });

    // 2. Fetch Common Issues & Suggestions (unwind arrays)
    const reviews = await Review.find(query).select('departmentIssues improvementSuggestions sentiment reviewSummary');
    
    const issueCounts = {};
    const suggestionCounts = {};
    let recentMixedReviews = [];

    reviews.forEach(r => {
      if (r.departmentIssues) {
        r.departmentIssues.forEach(issue => {
          issueCounts[issue] = (issueCounts[issue] || 0) + 1;
        });
      }
      if (r.improvementSuggestions) {
        r.improvementSuggestions.forEach(sug => {
          suggestionCounts[sug] = (suggestionCounts[sug] || 0) + 1;
        });
      }
      if (r.sentiment !== 'Positive' && r.reviewSummary) {
        recentMixedReviews.push(r.reviewSummary);
      }
    });

    // Sort issues and suggestions to find top 5
    const topIssues = Object.keys(issueCounts)
      .map(key => ({ issue: key, count: issueCounts[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topSuggestions = Object.keys(suggestionCounts)
      .map(key => ({ suggestion: key, count: suggestionCounts[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Monthly Trends (aggregated by year-month)
    const monthlyTrends = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$reviewDate' },
            month: { $month: '$reviewDate' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' }
        }
      },
      {
        $project: {
          _id: 0,
          label: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, '0', ''] },
              { $toString: '$_id.month' }
            ]
          },
          count: 1,
          avgRating: 1
        }
      },
      { $sort: { label: 1 } }
    ]);

    res.json({
      urgency: {
        low: lowUrgency,
        medium: mediumUrgency,
        high: highUrgency
      },
      topIssues,
      topSuggestions,
      monthlyTrends,
      recentInsights: recentMixedReviews.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getDepartmentWiseRatings,
  getDoctorWiseRatings,
  getAiAnalytics
};
