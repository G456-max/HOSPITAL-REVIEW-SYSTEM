const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: String,
    trim: true
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
