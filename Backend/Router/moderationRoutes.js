const express = require('express');
const router = express.Router();
const {
  createReport,
  getReportReasons,
  blockUserHandler,
  unblockUserHandler,
  getMyBlockedUsers,
  adminGetReports,
  adminUpdateReportStatus,
  adminGetEvents,
  adminMarkEventRead,
  adminGetBlocks
} = require('../Controllers/moderationController');
const { protectUser } = require('../Middlewares/userAuthMiddleware');
const { protectAdmin } = require('../Middlewares/authMiddleware');

// Public
router.get('/reports/reasons', getReportReasons);

// User — reports
router.post('/reports', protectUser, createReport);

// User — blocks
router.get('/users/me/blocked', protectUser, getMyBlockedUsers);
router.post('/users/:userId/block', protectUser, blockUserHandler);
router.delete('/users/:userId/block', protectUser, unblockUserHandler);

// Admin — safety moderation
router.get('/admin/moderation/reports', protectAdmin, adminGetReports);
router.put('/admin/moderation/reports/:id', protectAdmin, adminUpdateReportStatus);
router.get('/admin/moderation/events', protectAdmin, adminGetEvents);
router.put('/admin/moderation/events/:id/read', protectAdmin, adminMarkEventRead);
router.get('/admin/moderation/blocks', protectAdmin, adminGetBlocks);

module.exports = router;
