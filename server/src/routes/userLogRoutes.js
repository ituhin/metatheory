const express = require('express');
const router = express.Router();
const { getUserLogs, deleteUserLog } = require('../controller/userLogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getUserLogs);
router.delete('/:_id', protect, adminOnly, deleteUserLog);

module.exports = router;