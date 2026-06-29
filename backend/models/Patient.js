const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  patientType: {
    type: String,
    required: true,
    enum: ['Inpatient', 'Outpatient'],
    default: 'Inpatient'
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  ward: {
    type: String,
    trim: true
  },
  bedNumber: {
    type: String,
    trim: true
  },
  admissionDate: {
    type: Date,
    required: function() { return this.patientType === 'Inpatient'; }
  },
  dischargeDate: {
    type: Date,
    required: function() { return this.patientType === 'Inpatient'; }
  },
  visitDate: {
    type: Date,
    required: function() { return this.patientType === 'Outpatient'; }
  },
  diagnosis: {
    type: String,
    trim: true
  },
  treatment: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Admitted', 'Discharged'],
    default: 'Discharged'
  },
  reviewSubmitted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
