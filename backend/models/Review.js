const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  patientName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  patientType: {
    type: String,
    required: true,
    enum: ['Inpatient', 'Outpatient'],
    default: 'Inpatient'
  },
  ratings: {
    registrationProcess: { type: Number, required: true },
    
    doctorListened: { type: Number, required: true },
    doctorExplained: { type: Number, required: true },
    doctorSpentTime: { type: Number, required: true },
    doctorBehaved: { type: Number, required: true },
    doctorConfidence: { type: Number, required: true },
    
    nursesPolite: { type: Number, required: true },
    nursesQuick: { type: Number, required: true },
    nursesMedicinesTime: { type: Number, required: true },
    nursesPainManagement: { type: Number, required: true },
    nursesOverallSupport: { type: Number, required: true },
    
    wardCleanliness: { type: Number, required: true },
    bathroomCleanliness: { type: Number, required: true },
    bedCleanliness: { type: Number, required: true },
    dustFreeEnvironment: { type: Number, required: true },
    overallHygiene: { type: Number, required: true },
    
    sampleCollectionExperience: { type: Number, required: true },
    waitingTimeLab: { type: Number, required: true },
    staffBehaviourLab: { type: Number, required: true },
    reportDeliveryLab: { type: Number, required: true },
    
    medicineAvailability: { type: Number, required: true },
    waitingTimePharmacy: { type: Number, required: true },
    pharmacistExplanation: { type: Number, required: true },
    medicineQuality: { type: Number, required: true },
    
    foodQuality: { type: Number, required: true },
    foodTaste: { type: Number, required: true },
    foodTemperature: { type: Number, required: true },
    foodTimelyDelivery: { type: Number, required: true },
    foodDietFollowed: { type: Number, required: true },
    
    billingProcess: { type: Number, required: true },
    billingTransparency: { type: Number, required: true },
    billingWaitingTime: { type: Number, required: true },
    billingOverallSatisfaction: { type: Number, required: true },
    
    hospitalSecurity: { type: Number, required: true },
    hospitalNavigation: { type: Number, required: true },
    hospitalEnvironment: { type: Number, required: true },
    hospitalRecommendation: { type: Number, required: true },
    hospitalOverallExperience: { type: Number, required: true }
  },
  overallRating: {
    type: Number,
    required: true
  },
  suggestions: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // AI Section
  sentiment: {
    type: String,
    enum: ['Positive', 'Negative', 'Mixed'],
    required: true
  },
  positivePercentage: { type: Number, default: 0 },
  negativePercentage: { type: Number, default: 0 },
  reviewSummary: { type: String, trim: true },
  positivePoints: [{ type: String }],
  negativePoints: [{ type: String }],
  improvementSuggestions: [{ type: String }],
  departmentIssues: [{ type: String }],
  doctorFeedback: { type: String, trim: true },
  urgencyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  reviewDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
