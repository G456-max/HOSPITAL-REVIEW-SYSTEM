const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Verify patient credentials to allow review access
 * @route   POST /api/patient/verify
 * @access  Public
 */
const verifyPatient = async (req, res, next) => {
  const { patientId, mobileNumber } = req.body;

  if (!patientId || !mobileNumber) {
    res.status(400);
    return next(new Error('Please provide Patient ID and Mobile Number'));
  }

  try {
    const patient = await Patient.findOne({
      patientId: patientId.trim().toUpperCase()
    });

    if (!patient) {
      res.status(404);
      return next(new Error('Medical registration record not found. Please contact hospital reception.'));
    }

    // Verify mobile number (ends with match to avoid trailing format discrepancies)
    const clientMobile = mobileNumber.replace(/\D/g, '');
    const dbMobile = patient.mobileNumber.replace(/\D/g, '');
    if (!dbMobile.endsWith(clientMobile) && !clientMobile.endsWith(dbMobile)) {
      res.status(401);
      return next(new Error('Mobile number does not match registration records.'));
    }

    // Verify status = Discharged
    if (patient.status !== 'Discharged') {
      res.status(403);
      return next(new Error('Patient stays in status "Admitted". Reviews are only permitted post-discharge.'));
    }

    // Verify duplicate review
    if (patient.reviewSubmitted) {
      res.status(403);
      return next(new Error('Feedback has already been logged for this patient registration ID. Duplicate reviews are prevented.'));
    }

    res.json(patient);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patient details by ID
 * @route   GET /api/patient/:id
 * @access  Public
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id.toUpperCase() });
    if (!patient) {
      res.status(404);
      return next(new Error('Patient stay record not found.'));
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new inpatient stay
 * @route   POST /api/patients
 * @access  Private (Admins)
 */
const registerPatient = async (req, res, next) => {
  const patientData = req.body;

  try {
    const exists = await Patient.findOne({ patientId: patientData.patientId.toUpperCase() });
    if (exists) {
      res.status(400);
      return next(new Error('Patient stay with this ID is already registered'));
    }

    const patient = await Patient.create({
      ...patientData,
      patientId: patientData.patientId.toUpperCase()
    });

    // Audit log
    await AuditLog.create({
      action: 'Register Patient',
      performedBy: req.user ? req.user.username : 'API Admin',
      details: `Inpatient stay registered: '${patient.patientName}' (ID: ${patient.patientId}, Doctor: ${patient.doctorName}).`
    });

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all patients with filters
 * @route   GET /api/patient
 * @access  Private (Admins)
 */
const getPatients = async (req, res, next) => {
  try {
    const query = {};
    if (req.user && req.user.role === 'DepartmentAdmin') {
      query.department = req.user.department;
    }
    
    const { search, patientType, status } = req.query;
    if (patientType) query.patientType = patientType;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { patientId: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyPatient,
  getPatientById,
  registerPatient,
  getPatients
};
