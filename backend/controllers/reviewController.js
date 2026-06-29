const Review = require('../models/Review');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { analyzeReview, draftReviewComments } = require('../services/geminiService');

/**
 * @desc    Submit patient feedback review & run Gemini AI analysis
 * @route   POST /api/review
 * @access  Public
 */
const submitReview = async (req, res, next) => {
  const { 
    patientId, ratings, suggestions, overallRating,
    patientName, age, gender, mobileNumber, patientType,
    department, doctorName, ward, bedNumber, 
    admissionDate, dischargeDate, visitDate 
  } = req.body;

  if (!patientId || !ratings || !suggestions || overallRating === undefined) {
    res.status(400);
    return next(new Error('Please fill in all rating scores and suggestions.'));
  }

  try {
    let patient = await Patient.findOne({ patientId: patientId.toUpperCase() });
    
    if (!patient) {
      // Direct submission: create the patient stay record dynamically
      patient = await Patient.create({
        patientId: patientId.toUpperCase(),
        patientName: patientName || 'Patient',
        age: age || 35,
        gender: gender || 'Male',
        mobileNumber: mobileNumber || '9999999999',
        patientType: patientType || 'Inpatient',
        department: department || 'General Medicine',
        doctorName: doctorName || 'Consultant',
        ward: ward || '',
        bedNumber: bedNumber || '',
        admissionDate: admissionDate || new Date(),
        dischargeDate: dischargeDate || new Date(),
        visitDate: visitDate || new Date(),
        status: 'Discharged',
        reviewSubmitted: true
      });
    } else {
      if (patient.reviewSubmitted) {
        res.status(400);
        return next(new Error('Feedback has already been logged for this patient registration ID.'));
      }
      
      // Update details to match submission form if provided
      if (patientName) patient.patientName = patientName;
      if (age) patient.age = age;
      if (gender) patient.gender = gender;
      if (mobileNumber) patient.mobileNumber = mobileNumber;
      if (patientType) patient.patientType = patientType;
      if (department) patient.department = department;
      if (doctorName) patient.doctorName = doctorName;
      if (ward) patient.ward = ward;
      if (bedNumber) patient.bedNumber = bedNumber;
      if (admissionDate) patient.admissionDate = admissionDate;
      if (dischargeDate) patient.dischargeDate = dischargeDate;
      if (visitDate) patient.visitDate = visitDate;
      
      patient.reviewSubmitted = true;
      await patient.save();
    }

    // Call Gemini AI service to perform analysis
    const aiResult = await analyzeReview({
      department: patient.department,
      doctorName: patient.doctorName,
      ratings,
      suggestions,
      overallRating
    });

    const review = await Review.create({
      patientId: patient.patientId,
      patientName: patient.patientName,
      department: patient.department,
      doctorName: patient.doctorName,
      patientType: patient.patientType,
      ratings,
      overallRating,
      suggestions,
      
      // AI analysis mapping
      sentiment: aiResult.overallSentiment,
      positivePercentage: aiResult.positivePercentage,
      negativePercentage: aiResult.negativePercentage,
      reviewSummary: aiResult.summary,
      positivePoints: aiResult.positivePoints,
      negativePoints: aiResult.negativePoints,
      improvementSuggestions: aiResult.improvementSuggestions,
      departmentIssues: aiResult.departmentIssues,
      doctorFeedback: aiResult.doctorFeedback,
      urgencyLevel: aiResult.urgencyLevel
    });

    // Update patient review status
    patient.reviewSubmitted = true;
    await patient.save();

    // Check Department Average Rating to trigger Low Rating Notifications
    const deptReviews = await Review.find({ department: patient.department });
    if (deptReviews.length > 0) {
      const sum = deptReviews.reduce((acc, r) => acc + r.overallRating, 0);
      const avg = sum / deptReviews.length;

      if (avg < 3.0) {
        // Trigger alert if no unresolved notification exists for this department
        const alertExists = await Notification.findOne({
          department: patient.department,
          resolved: false
        });

        if (!alertExists) {
          await Notification.create({
            department: patient.department,
            message: `CRITICAL ALERT: The satisfaction index for the "${patient.department}" department has dropped to ${avg.toFixed(1)}/5.0 stars (based on ${deptReviews.length} reviews). Please check housekeeper audits and ward cleanliness logs.`
          });
        }
      }
    }

    // Write audit log
    await AuditLog.create({
      action: 'Submit Feedback',
      performedBy: patient.patientId,
      details: `Patient feedback registered for registration ID: ${patient.patientId} (Dept: ${patient.department}, Rating: ${overallRating}/5, Sentiment: ${aiResult.overallSentiment}).`
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all patient reviews with filters and search
 * @route   GET /api/reviews
 * @access  Private (Admins)
 */
const getReviews = async (req, res, next) => {
  try {
    const { department, doctor, rating, sentiment, patientType, search, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    // Apply role-based visibility scoping
    if (req.user && req.user.role === 'DepartmentAdmin') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (doctor) query.doctorName = doctor;
    if (rating) query.overallRating = Number(rating);
    if (sentiment) query.sentiment = sentiment;
    if (patientType) query.patientType = patientType;

    // Date range filters
    if (startDate || endDate) {
      query.reviewDate = {};
      if (startDate) query.reviewDate.$gte = new Date(startDate);
      if (endDate) query.reviewDate.$lte = new Date(endDate);
    }

    // Search query
    if (search) {
      query.$or = [
        { patientId: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { suggestions: { $regex: search, $options: 'i' } }
      ];
    }

    const count = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .sort({ reviewDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      reviews,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get review by ID
 * @route   GET /api/reviews/:id
 * @access  Private
 */
const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      return next(new Error('Feedback record not found.'));
    }

    // Role check: Department admin can only view their own department
    if (req.user && req.user.role === 'DepartmentAdmin' && req.user.department !== review.department) {
      res.status(403);
      return next(new Error('Access denied. Scoped department admin only.'));
    }

    res.json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a review
 * @route   PUT /api/review/:id
 * @access  Private (SuperAdmin only)
 */
const updateReview = async (req, res, next) => {
  const { ratings, suggestions, overallRating } = req.body;

  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      return next(new Error('Review record not found.'));
    }

    // Re-run Gemini AI analysis for modified values
    const aiResult = await analyzeReview({
      department: review.department,
      doctorName: review.doctorName,
      ratings,
      suggestions,
      overallRating
    });

    review.ratings = ratings;
    review.suggestions = suggestions;
    review.overallRating = overallRating;
    
    review.sentiment = aiResult.overallSentiment;
    review.positivePercentage = aiResult.positivePercentage;
    review.negativePercentage = aiResult.negativePercentage;
    review.reviewSummary = aiResult.summary;
    review.positivePoints = aiResult.positivePoints;
    review.negativePoints = aiResult.negativePoints;
    review.improvementSuggestions = aiResult.improvementSuggestions;
    review.departmentIssues = aiResult.departmentIssues;
    review.doctorFeedback = aiResult.doctorFeedback;
    review.urgencyLevel = aiResult.urgencyLevel;

    await review.save();

    // Log audit action
    await AuditLog.create({
      action: 'Edit Review',
      performedBy: req.user.username,
      details: `SuperAdmin '${req.user.username}' updated feedback scores and re-analyzed review for Patient ID: ${review.patientId}.`
    });

    res.json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete feedback & restore review submitted state
 * @route   DELETE /api/review/:id
 * @access  Private (SuperAdmin only)
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      return next(new Error('Review record not found.'));
    }

    // Reset patient reviewSubmitted flag
    const patient = await Patient.findOne({ patientId: review.patientId });
    if (patient) {
      patient.reviewSubmitted = false;
      await patient.save();
    }

    await Review.findByIdAndDelete(req.params.id);

    // Audit log
    await AuditLog.create({
      action: 'Delete Review',
      performedBy: req.user.username,
      details: `SuperAdmin '${req.user.username}' deleted review for Patient ID: ${review.patientId}. Reset reviewSubmitted = false.`
    });

    res.json({ message: 'Review successfully deleted, and patient permitted to re-submit.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active notifications list
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const query = {};
    if (req.user && req.user.role === 'DepartmentAdmin') {
      query.department = req.user.department;
    }
    const alerts = await Notification.find(query).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve alert warning
 * @route   PUT /api/notifications/:id/resolve
 * @access  Private
 */
const resolveNotification = async (req, res, next) => {
  try {
    const alert = await Notification.findById(req.params.id);
    if (!alert) {
      res.status(404);
      return next(new Error('Alert notification not found'));
    }

    alert.resolved = true;
    alert.resolvedBy = req.user.username;
    alert.resolvedAt = new Date();
    await alert.save();

    // Audit log
    await AuditLog.create({
      action: 'Resolve Warning Alert',
      performedBy: req.user.username,
      details: `Admin '${req.user.username}' resolved low rating alert warning for ${alert.department} department.`
    });

    res.json(alert);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate feedback draft comments based on ratings and overall stars
 * @route   POST /api/review/generate-comments
 * @access  Public
 */
const generateSuggestions = async (req, res, next) => {
  const { ratings, overallRating, suggestions } = req.body;
  if (!ratings || overallRating === undefined) {
    res.status(400);
    return next(new Error('Missing ratings or overall rating parameters.'));
  }
  try {
    const draft = await draftReviewComments(ratings, overallRating, suggestions);
    res.json({ draft });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getNotifications,
  resolveNotification,
  generateSuggestions
};
