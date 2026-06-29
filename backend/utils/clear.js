const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const clearDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital-review-system');
    console.log('Database Clear: MongoDB connected...');

    // Delete records
    await Patient.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Database Clear: Cleared patients, reviews, notifications, and audit logs.');

    // Ensure default admins exist
    await Admin.deleteMany({});
    const superadmin = new Admin({
      username: 'superadmin',
      password: 'admin1',
      role: 'SuperAdmin'
    });
    await superadmin.save();

    const hospitaladmin = new Admin({
      username: 'admin',
      password: 'admin',
      role: 'HospitalAdmin'
    });
    await hospitaladmin.save();

    const deptadmin = new Admin({
      username: 'deptadmin',
      password: 'admin1',
      role: 'DepartmentAdmin',
      department: 'Orthopedics'
    });
    await deptadmin.save();

    console.log('Database Clear: Admin accounts restored successfully.');
    console.log('Credentials: (superadmin/admin123), (admin/admin123), (deptadmin/admin123)');

    await AuditLog.create({
      action: 'Database Clear',
      performedBy: 'System Clear Script',
      details: 'All review and patient stay records cleared. Admins restored.'
    });

    console.log('Database successfully cleared! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('Database clearing failed:', error);
    process.exit(1);
  }
};

clearDB();
