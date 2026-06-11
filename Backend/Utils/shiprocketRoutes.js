const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../Middlewares/authMiddleware');
const shiprocketController = require('../Controllers/shiprocketController');

// Admin APIs
router.post('/serviceability', protectAdmin, shiprocketController.checkServiceability);
router.post('/assign-awb', protectAdmin, shiprocketController.assignAWB);
router.post('/request-pickup', protectAdmin, shiprocketController.requestPickup);
router.post('/generate-label', protectAdmin, shiprocketController.generateLabel);

// Webhook (Public, called by Shiprocket)
router.post('/webhook', shiprocketController.webhookReceiver);

module.exports = router;
