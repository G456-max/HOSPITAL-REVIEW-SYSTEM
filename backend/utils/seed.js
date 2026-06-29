const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const patientsData = [
  {
    patientId: 'P101',
    patientName: 'Koteswara Rao',
    age: 58,
    gender: 'Male',
    mobileNumber: '9848012345',
    patientType: 'Inpatient',
    department: 'Cardiology',
    doctorName: 'Dr. A. K. Prasad',
    ward: 'Cardio ICU',
    bedNumber: 'Bed 12',
    admissionDate: new Date('2026-06-01'),
    dischargeDate: new Date('2026-06-08'),
    diagnosis: 'Myocardial Infarction',
    treatment: 'Coronary Angioplasty & Stenting',
    status: 'Discharged',
    reviewSubmitted: true
  },
  {
    patientId: 'P102',
    patientName: 'Lalitha Kumari',
    age: 45,
    gender: 'Female',
    mobileNumber: '9440154321',
    patientType: 'Inpatient',
    department: 'Orthopedics',
    doctorName: 'Dr. G. Srinivas',
    ward: 'Orthopedic Ward B',
    bedNumber: 'Bed 05',
    admissionDate: new Date('2026-06-03'),
    dischargeDate: new Date('2026-06-07'),
    diagnosis: 'Femur Fracture',
    treatment: 'Internal Fixation Surgery',
    status: 'Discharged',
    reviewSubmitted: false
  },
  {
    patientId: 'P103',
    patientName: 'Rami Reddy',
    age: 62,
    gender: 'Male',
    mobileNumber: '9908122334',
    patientType: 'Inpatient',
    department: 'Pediatrics',
    doctorName: 'Dr. M. Suseela',
    ward: 'Pediatric ICU',
    bedNumber: 'Bed 01',
    admissionDate: new Date('2026-06-10'),
    dischargeDate: new Date('2026-06-14'),
    diagnosis: 'Severe Pneumonia',
    treatment: 'Oxygen support & IV Antibiotics',
    status: 'Discharged',
    reviewSubmitted: true
  },
  {
    patientId: 'P104',
    patientName: 'Subhadra Devi',
    age: 38,
    gender: 'Female',
    mobileNumber: '8897543210',
    patientType: 'Outpatient',
    department: 'Gynaecology',
    doctorName: 'Dr. Lakshmi Prasanna',
    visitDate: new Date('2026-06-18'),
    diagnosis: 'Normal Ante-natal checkup',
    treatment: 'Obstetrical Care & Vitamins',
    status: 'Discharged',
    reviewSubmitted: false
  },
  {
    patientId: 'P105',
    patientName: 'Ch. Appa Rao',
    age: 50,
    gender: 'Male',
    mobileNumber: '7702812345',
    patientType: 'Inpatient',
    department: 'General Medicine',
    doctorName: 'Dr. V. Satyanarayana',
    ward: 'Medical Ward A',
    bedNumber: 'Bed 22',
    admissionDate: new Date('2026-06-18'),
    dischargeDate: new Date('2026-06-25'),
    diagnosis: 'Acute Dengue Fever',
    treatment: 'IV Fluids & Platelet Monitoring',
    status: 'Admitted',
    reviewSubmitted: false
  },
  {
    patientId: 'P106',
    patientName: 'Satya Narayana',
    age: 54,
    gender: 'Male',
    mobileNumber: '9177234567',
    patientType: 'Outpatient',
    department: 'Gastroenterology',
    doctorName: 'Dr. P. Venkateswarlu',
    visitDate: new Date('2026-06-10'),
    diagnosis: 'Mild Gastritis',
    treatment: 'Antacids & Dietary Guidance',
    status: 'Discharged',
    reviewSubmitted: true
  }
];

const mockReviews = [
  {
    patientId: 'P101',
    patientName: 'Koteswara Rao',
    patientType: 'Inpatient',
    department: 'Cardiology',
    doctorName: 'Dr. A. K. Prasad',
    ratings: {
      registrationProcess: 5,
      doctorListened: 5,
      doctorExplained: 5,
      doctorSpentTime: 4,
      doctorBehaved: 5,
      doctorConfidence: 5,
      nursesPolite: 5,
      nursesQuick: 4,
      nursesMedicinesTime: 5,
      nursesPainManagement: 5,
      nursesOverallSupport: 5,
      wardCleanliness: 4,
      bathroomCleanliness: 3,
      bedCleanliness: 5,
      dustFreeEnvironment: 4,
      overallHygiene: 4,
      sampleCollectionExperience: 5,
      waitingTimeLab: 4,
      staffBehaviourLab: 5,
      reportDeliveryLab: 4,
      medicineAvailability: 5,
      waitingTimePharmacy: 3,
      pharmacistExplanation: 4,
      medicineQuality: 5,
      foodQuality: 4,
      foodTaste: 3,
      foodTemperature: 4,
      foodTimelyDelivery: 4,
      foodDietFollowed: 5,
      billingProcess: 4,
      billingTransparency: 5,
      billingWaitingTime: 3,
      billingOverallSatisfaction: 4,
      hospitalSecurity: 5,
      hospitalNavigation: 4,
      hospitalEnvironment: 4,
      hospitalRecommendation: 5,
      hospitalOverallExperience: 5
    },
    overallRating: 5,
    suggestions: 'Overall treatment in Cardiology under Dr. Prasad was exceptional. The nursing staff was highly attentive. The toilet cleanliness in General Ward could be improved.',
    sentiment: 'Positive',
    positivePercentage: 90,
    negativePercentage: 5,
    reviewSummary: 'Patient had an outstanding experience in Cardiology. Praised the nursing staff and Dr. Prasad. Indicated washroom cleaning could be improved.',
    positivePoints: ['Attentive nursing care', 'Exceptional treatment by doctor'],
    negativePoints: ['Washroom hygiene needs attention'],
    improvementSuggestions: ['Increase bathroom cleaning frequency.'],
    departmentIssues: ['Housekeeping'],
    doctorFeedback: 'High confidence and politeness.',
    urgencyLevel: 'Low',
    reviewDate: new Date('2026-06-09')
  },
  {
    patientId: 'P103',
    patientName: 'Rami Reddy',
    patientType: 'Inpatient',
    department: 'Pediatrics',
    doctorName: 'Dr. M. Suseela',
    ratings: {
      registrationProcess: 2,
      doctorListened: 4,
      doctorExplained: 3,
      doctorSpentTime: 3,
      doctorBehaved: 4,
      doctorConfidence: 4,
      nursesPolite: 3,
      nursesQuick: 2,
      nursesMedicinesTime: 4,
      nursesPainManagement: 3,
      nursesOverallSupport: 3,
      wardCleanliness: 3,
      bathroomCleanliness: 2,
      bedCleanliness: 3,
      dustFreeEnvironment: 3,
      overallHygiene: 3,
      sampleCollectionExperience: 4,
      waitingTimeLab: 2,
      staffBehaviourLab: 3,
      reportDeliveryLab: 3,
      medicineAvailability: 2,
      waitingTimePharmacy: 1,
      pharmacistExplanation: 3,
      medicineQuality: 4,
      foodQuality: 2,
      foodTaste: 2,
      foodTemperature: 3,
      foodTimelyDelivery: 3,
      foodDietFollowed: 3,
      billingProcess: 2,
      billingTransparency: 3,
      billingWaitingTime: 2,
      billingOverallSatisfaction: 2,
      hospitalSecurity: 4,
      hospitalNavigation: 3,
      hospitalEnvironment: 3,
      hospitalRecommendation: 3,
      hospitalOverallExperience: 3
    },
    overallRating: 3,
    suggestions: 'The pharmacy wait times are horrible. It took more than 45 minutes to get medicines. Nurses were a bit slow to respond to calls.',
    sentiment: 'Mixed',
    positivePercentage: 45,
    negativePercentage: 40,
    reviewSummary: 'Mixed stay. Patient complained about pharmacy drug availability and long waiting queues. Nursing care response times were also noted as slow.',
    positivePoints: ['Treating doctor behaved politely'],
    negativePoints: ['Extreme pharmacy waiting delay', 'Slow nurse promptness'],
    improvementSuggestions: ['Streamline pharmacy dispensing process', 'Deploy more nursing staff on shifts'],
    departmentIssues: ['Pharmacy', 'Nursing Care'],
    doctorFeedback: 'Satisfied with pediatric consultation.',
    urgencyLevel: 'Medium',
    reviewDate: new Date('2026-06-15')
  },
  {
    patientId: 'P106',
    patientName: 'Satya Narayana',
    patientType: 'Outpatient',
    department: 'Gastroenterology',
    doctorName: 'Dr. P. Venkateswarlu',
    ratings: {
      registrationProcess: 1,
      doctorListened: 2,
      doctorExplained: 2,
      doctorSpentTime: 2,
      doctorBehaved: 2,
      doctorConfidence: 2,
      nursesPolite: 2,
      nursesQuick: 1,
      nursesMedicinesTime: 3,
      nursesPainManagement: 2,
      nursesOverallSupport: 2,
      wardCleanliness: 2,
      bathroomCleanliness: 1,
      bedCleanliness: 2,
      dustFreeEnvironment: 2,
      overallHygiene: 2,
      sampleCollectionExperience: 3,
      waitingTimeLab: 1,
      staffBehaviourLab: 2,
      reportDeliveryLab: 2,
      medicineAvailability: 2,
      waitingTimePharmacy: 2,
      pharmacistExplanation: 2,
      medicineQuality: 3,
      foodQuality: 2,
      foodTaste: 1,
      foodTemperature: 1,
      foodTimelyDelivery: 2,
      foodDietFollowed: 2,
      billingProcess: 1,
      billingTransparency: 2,
      billingWaitingTime: 1,
      billingOverallSatisfaction: 1,
      hospitalSecurity: 3,
      hospitalNavigation: 2,
      hospitalEnvironment: 2,
      hospitalRecommendation: 1,
      hospitalOverallExperience: 1
    },
    overallRating: 1.5,
    suggestions: 'Worst experience. The toilets were extremely dirty, bad smell everywhere. The doctors spent barely 2 minutes, and the billing queue took forever. Food served was cold and tasteless.',
    sentiment: 'Negative',
    positivePercentage: 10,
    negativePercentage: 85,
    reviewSummary: 'Extremely poor experience. Dirty washrooms, long billing and lab queues, cold food served. Dissatisfied with doctor visits and nurse responsiveness.',
    positivePoints: ['Security was fine'],
    negativePoints: ['Dirty toilet facilities', 'Cold and tasteless meals', 'Extremely long billing clearance queues'],
    improvementSuggestions: ['Improve housekeeping schedules immediately', 'Warm food delivery systems', 'Open additional discharge billing counters'],
    departmentIssues: ['Housekeeping', 'Food Services', 'Billing & Finance'],
    doctorFeedback: 'Felt doctor spent insufficient time.',
    urgencyLevel: 'High',
    reviewDate: new Date('2026-06-11')
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital-review-system');
    console.log('Seed: MongoDB connected...');

    // Clear old data
    await Patient.deleteMany({});
    await Admin.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Seed: Existing collections dropped successfully.');

    // Seed patients
    await Patient.insertMany(patientsData);
    console.log('Seed: Patient stay registries inserted.');

    // Seed reviews
    await Review.insertMany(mockReviews);
    console.log('Seed: Inpatient/Outpatient reviews database seeded.');

    // Seed Admins
    const superadmin = new Admin({
      username: 'superadmin',
      password: 'admin123',
      role: 'SuperAdmin'
    });
    await superadmin.save();

    const hospitaladmin = new Admin({
      username: 'admin',
      password: 'admin123',
      role: 'HospitalAdmin'
    });
    await hospitaladmin.save();

    const deptadmin = new Admin({
      username: 'deptadmin',
      password: 'admin123',
      role: 'DepartmentAdmin',
      department: 'Orthopedics'
    });
    await deptadmin.save();

    console.log('Seed: Admin users created. Credentials: (superadmin/admin123), (admin/admin123), (deptadmin/admin123)');

    // Seed Audit Log
    await AuditLog.create({
      action: 'Initialize Database Seed',
      performedBy: 'System Seeder',
      details: 'Mock database records initialized including patients, admins, and reviews.'
    });

    // Seed low satisfaction notification
    await Notification.create({
      department: 'Gastroenterology',
      message: `CRITICAL ALERT: The satisfaction index for the "Gastroenterology" department has dropped to 1.5/5.0 stars (based on 1 reviews). Please check housekeeper audits and ward cleanliness logs.`
    });
    console.log('Seed: Alert warning registered for Gastroenterology.');

    console.log('Seeding successfully completed! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

seedDB();
