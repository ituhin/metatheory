const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loginTime: {
    type: Date,
    default: () => new Date(Date.now()), // UTC
  },
  logoutTime: {
    type: Date,
  },
  token: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
});

// Ensure UTC for timestamps
userLogSchema.pre('save', function (next) {
  if (this.loginTime) this.loginTime = new Date(this.loginTime.getTime());
  if (this.logoutTime) this.logoutTime = new Date(this.logoutTime.getTime());
  next();
});

const UserLog = mongoose.model('UserLog', userLogSchema);

module.exports = UserLog;