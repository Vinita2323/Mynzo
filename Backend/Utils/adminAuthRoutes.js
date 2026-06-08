const express = require('express');
const router = express.Router();
const { adminLogin, getMe, adminLogout } = require('../Controllers/adminAuthController');
const { protectAdmin } = require('../Middlewares/authMiddleware');

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.get('/me', protectAdmin, getMe);
router.post('/logout', protectAdmin, adminLogout);

module.exports = router;
