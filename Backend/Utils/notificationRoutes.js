const express = require('express');
const router = express.Router();
const notificationController = require('../Controllers/notificationController');
const { protectAdmin } = require('../Middlewares/authMiddleware');

router.post('/send', protectAdmin, notificationController.sendBroadcast);
router.get('/', protectAdmin, notificationController.getHistory);

module.exports = router;
