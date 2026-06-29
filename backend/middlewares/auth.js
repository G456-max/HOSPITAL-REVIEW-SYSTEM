const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

      // Get user from token
      req.user = await Admin.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists in system' });
      }

      return next();
    } catch (error) {
      console.error('JWT validation error:', error);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, token missing' });
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this resource`
      });
    }
    
    next();
  };
};

module.exports = {
  protect,
  authorize
};
