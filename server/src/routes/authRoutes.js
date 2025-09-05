const express = require("express");
const router = express.Router();

const { registerUser, loginUser, logout } = require('../controller/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logout);

module.exports = router;