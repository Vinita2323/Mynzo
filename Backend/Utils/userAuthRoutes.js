const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getMe } = require('../Controllers/userAuthController');
const { protectUser } = require('../Middlewares/userAuthMiddleware');

// Public routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Protected routes
router.get('/me', protectUser, getMe);

module.exports = router;
