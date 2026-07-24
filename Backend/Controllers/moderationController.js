const {
  REPORT_REASONS,
  REASON_LABELS,
  createContentReport,
  blockUser,
  unblockUser,
  getBlockedUserIds
} = require('../services/moderationService');
const ContentReport = require('../Models/ContentReport');
const ModerationEvent = require('../Models/ModerationEvent');
const UserBlock = require('../Models/UserBlock');

// @desc    Report Studio video / content
// @route   POST /reports
// @access  Private (User)
exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    const result = await createContentReport({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason,
      description
    });

    return res.status(result.alreadyReported ? 200 : 201).json({
      success: true,
      message: result.message,
      alreadyReported: result.alreadyReported,
      report: {
        id: result.report._id,
        status: result.report.status,
        reason: result.report.reason
      }
    });
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) {
      console.error('Create Report Error:', error);
    }
    return res.status(status).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    List allowed report reasons (for UI)
// @route   GET /reports/reasons
// @access  Public
exports.getReportReasons = async (_req, res) => {
  const reasons = REPORT_REASONS.map((value) => ({
    value,
    label: REASON_LABELS[value] || value
  }));
  return res.status(200).json({ success: true, reasons });
};

// @desc    Block a user
// @route   POST /users/:userId/block
// @access  Private (User)
exports.blockUserHandler = async (req, res) => {
  try {
    const blockedUserId = req.params.userId;
    const relatedVideoId = req.body?.relatedVideoId || req.body?.targetVideoId || null;

    const result = await blockUser({
      blockerId: req.user._id,
      blockedUserId,
      relatedVideoId
    });

    return res.status(200).json({
      success: true,
      blockedUserId: result.blockedUserId,
      isBlocked: true,
      alreadyBlocked: result.alreadyBlocked,
      message: result.message
    });
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) {
      console.error('Block User Error:', error);
    }
    return res.status(status).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Unblock a user
// @route   DELETE /users/:userId/block
// @access  Private (User)
exports.unblockUserHandler = async (req, res) => {
  try {
    const result = await unblockUser({
      blockerId: req.user._id,
      blockedUserId: req.params.userId
    });

    return res.status(200).json({
      success: true,
      blockedUserId: result.blockedUserId,
      isBlocked: false,
      wasBlocked: result.wasBlocked,
      message: result.message
    });
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) {
      console.error('Unblock User Error:', error);
    }
    return res.status(status).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get IDs of users blocked by current user
// @route   GET /users/me/blocked
// @access  Private (User)
exports.getMyBlockedUsers = async (req, res) => {
  try {
    const blockedUserIds = await getBlockedUserIds(req.user._id);
    return res.status(200).json({
      success: true,
      blockedUserIds: blockedUserIds.map((id) => id.toString())
    });
  } catch (error) {
    console.error('Get Blocked Users Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's submitted reports (with admin notes)
// @route   GET /reports/my
// @access  Private (User)
exports.getMyReports = async (req, res) => {
  try {
    const reports = await ContentReport.find({ reporterId: req.user._id })
      .populate('targetId', 'username caption video status')
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    const formatted = reports.map((r) => ({
      id: r._id,
      reason: r.reason,
      description: r.description || '',
      status: r.status,
      adminNote: r.adminNote || '',
      adminNoteUpdatedAt: r.adminNoteUpdatedAt || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      target: r.targetId
        ? {
            id: r.targetId._id,
            username: r.targetId.username,
            caption: r.targetId.caption || '',
            status: r.targetId.status
          }
        : null
    }));

    return res.status(200).json({ success: true, count: formatted.length, reports: formatted });
  } catch (error) {
    console.error('Get My Reports Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: list content reports
// @route   GET /admin/moderation/reports
// @access  Private (Admin)
exports.adminGetReports = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const reports = await ContentReport.find(query)
      .populate('reporterId', 'name phone')
      .populate('targetId', 'username caption video status')
      .sort({ createdAt: -1 })
      .limit(200);

    return res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    console.error('Admin Get Reports Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: update report status and/or admin note
// @route   PUT /admin/moderation/reports/:id
// @access  Private (Admin)
exports.adminUpdateReportStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const allowed = ['pending', 'reviewing', 'resolved', 'dismissed'];

    const report = await ContentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status !== undefined) {
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      report.status = status;
    }

    let noteJustSaved = false;
    let savedNoteText = '';

    if (adminNote !== undefined) {
      const note = String(adminNote).trim().slice(0, 2000);
      const previousNote = (report.adminNote || '').trim();
      report.adminNote = note;
      report.adminNoteUpdatedAt = new Date();
      if (req.admin?._id) {
        report.adminNoteBy = req.admin._id;
      }
      // Notify when a non-empty note is saved (new or updated)
      if (note && note !== previousNote) {
        noteJustSaved = true;
        savedNoteText = note;
      }
    }

    if (status === undefined && adminNote === undefined) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    await report.save();

    // Firebase push + in-app notification to the reporter when admin sends a note
    if (noteJustSaved && report.reporterId) {
      try {
        const Notification = require('../Models/Notification');
        const { sendNotificationToUser } = require('../Router/firebaseAdmin');

        const preview =
          savedNoteText.length > 120
            ? `${savedNoteText.slice(0, 117)}...`
            : savedNoteText;

        const title = 'Update on your report';
        const body = preview || 'Our safety team left a note on your report. Open Report Notes to read it.';

        const notification = new Notification({
          title,
          body,
          target: 'Selected Users',
          targetUserIds: [report.reporterId],
          status: 'Delivered',
          sentAt: new Date()
        });
        await notification.save();

        sendNotificationToUser(report.reporterId, {
          title,
          body,
          data: {
            type: 'report_admin_note',
            reportId: String(report._id),
            path: '/report-notes'
          }
        }).catch((e) => console.error('Report note push failed:', e.message));
      } catch (notifErr) {
        console.error('Error sending report-note notification:', notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: adminNote !== undefined
        ? (noteJustSaved ? 'Admin note saved and user notified' : 'Admin note saved')
        : `Report marked as ${status}`,
      report,
      notified: noteJustSaved
    });
  } catch (error) {
    console.error('Admin Update Report Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: list moderation / safety events (developer notifications)
// @route   GET /admin/moderation/events
// @access  Private (Admin)
exports.adminGetEvents = async (req, res) => {
  try {
    const events = await ModerationEvent.find({})
      .populate('reporterId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(300);

    return res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    console.error('Admin Get Events Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: mark moderation event as read
// @route   PUT /admin/moderation/events/:id/read
// @access  Private (Admin)
exports.adminMarkEventRead = async (req, res) => {
  try {
    const event = await ModerationEvent.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, event });
  } catch (error) {
    console.error('Admin Mark Event Read Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: block relationship overview (optional ops view)
// @route   GET /admin/moderation/blocks
// @access  Private (Admin)
exports.adminGetBlocks = async (_req, res) => {
  try {
    const blocks = await UserBlock.find({})
      .populate('blockerId', 'name phone')
      .populate('blockedUserId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(300);

    return res.status(200).json({ success: true, count: blocks.length, blocks });
  } catch (error) {
    console.error('Admin Get Blocks Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
