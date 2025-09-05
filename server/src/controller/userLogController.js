const UserLog = require('../models/UserLog');

// Get all user logs with fullName (for admin)
const getUserLogs = async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      const logs = await UserLog.aggregate([
        {
          $lookup: {
            from: 'users', // Collection name for User model
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true // Keep logs even if user is deleted
          }
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            loginTime: 1,
            logoutTime: 1,
            token: 1,
            ipAddress: 1,
            role: '$user.role',
            fullName: '$user.fullName' // Include fullName from User
          }
        },
        {
          $sort: { loginTime: -1 } // newest first
        },
        {
          $skip: parseInt(skip)
        },
        {
          $limit: parseInt(limit)
        }
      ]);

      //const total = await UserLog.countDocuments();
      const total = await UserLog.estimatedDocumentCount();
      res.json({ logs, total });
    } catch (err) {
      console.error('Error fetching user logs:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Delete a user log by id (for admin)
const deleteUserLog = async (req, res) => {
  try {
    const log = await UserLog.findByIdAndDelete(req.params._id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserLogs, deleteUserLog };