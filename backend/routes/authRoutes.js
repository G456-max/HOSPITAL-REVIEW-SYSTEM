const express = require('express');
const router = express.Router();
const { login, register, getMe, getAuditLogs } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/auth');

// Auth endpoints
router.post('/login', login);
router.post('/register', protect, authorize('SuperAdmin'), register);
router.get('/me', protect, getMe);

// Audit logs endpoint
router.get('/audit-logs', protect, authorize('SuperAdmin', 'HospitalAdmin'), getAuditLogs);

module.exports = router;
