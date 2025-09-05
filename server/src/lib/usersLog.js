const UserLog = require('../models/UserLog');

/**
 * Create a new user log entry when a user logs in
 * @param {Object} user - User object with _id, username, role
 * @param {String} token - JWT token
 * @param {String} ipAddress - User's IP address
 * @returns {Promise<Object>} Created log entry
 */
const userLoggedInEntry = async (user, token, ipAddress) => {
  try {
    const log = new UserLog({
      userId: user._id,
      email: user.email,
      role: user.role,
      loginTime: new Date(Date.now()), // Explicit UTC timestamp
      token,
      ipAddress,
    });
    await log.save();
    return log;
  } catch (err) {
    console.error('Error creating user log entry:', err);
    throw new Error('Failed to create user log entry');
  }
};

/**
 * Update logout time for the latest matching user log
 * @param {String} userId - User's ID
 * @param {String} token - JWT token
 * @returns {Promise<Object|null>} Updated log entry or null if not found
 */
const userLoggedOutEntry = async (userId, token) => {
  try {
    const log = await UserLog.findOneAndUpdate(
      { userId, token, logoutTime: null },
      { logoutTime: new Date(Date.now()) }, // Explicit UTC timestamp
      { new: true, sort: { loginTime: -1 } }
    );
    return log;
  } catch (err) {
    console.error('Error updating user log entry:', err);
    throw new Error('Failed to update user log entry');
  }
};

module.exports = { userLoggedInEntry, userLoggedOutEntry };