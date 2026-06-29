const express = require('express');
const router = express.Router();
const { verifyPatient, getPatientById, registerPatient, getPatients } = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/verify', verifyPatient);
router.get('/', protect, getPatients);
router.get('/:id', getPatientById);
router.post('/', protect, authorize('SuperAdmin', 'HospitalAdmin'), registerPatient);

module.exports = router;
