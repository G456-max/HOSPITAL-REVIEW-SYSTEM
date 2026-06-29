const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d'
  });
};

/**
 * @desc    Authenticate admin & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    return next(new Error('Please provide username and password'));
  }

  try {
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.comparePassword(password))) {
      // Create audit log
      await AuditLog.create({
        action: 'Admin Login',
        performedBy: admin.username,
        details: `Admin user '${admin.username}' logged in successfully. Role: ${admin.role}.`
      });

      res.json({
        token: generateToken(admin._id),
        user: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
          department: admin.department
        }
      });
    } else {
      res.status(401);
      next(new Error('Invalid username or password'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new admin
 * @route   POST /api/auth/register
 * @access  Private (SuperAdmin only)
 */
const register = async (req, res, next) => {
  const { username, password, role, department } = req.body;

  try {
    const adminExists = await Admin.findOne({ username });

    if (adminExists) {
      res.status(400);
      return next(new Error('Admin user already exists'));
    }

    const admin = await Admin.create({
      username,
      password,
      role,
      department
    });

    // Create audit log
    await AuditLog.create({
      action: 'Create Admin User',
      performedBy: req.user ? req.user.username : 'System',
      details: `New admin user '${username}' registered with role ${role}.`
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        department: admin.department
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current admin profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.json({
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      department: req.user.department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system audit logs
 * @route   GET /api/audit-logs
 * @access  Private (SuperAdmin or HospitalAdmin only)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  getAuditLogs
};
