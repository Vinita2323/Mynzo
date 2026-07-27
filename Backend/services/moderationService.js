const mongoose = require('mongoose');
const ContentReport = require('../Models/ContentReport');
const { REPORT_REASONS } = require('../Models/ContentReport');
const UserBlock = require('../Models/UserBlock');
const ModerationEvent = require('../Models/ModerationEvent');
const Reel = require('../Models/Reel');
const User = require('../Models/User');

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Harassment or bullying',
  hate_speech: 'Hate speech',
  violence: 'Violence or dangerous content',
  inappropriate_content: 'Nudity or sexual content',
  scam_fraud: 'Scam or fraud',
  copyright: 'Copyright or intellectual property',
  other: 'Other'
};

/**
 * Create an admin-visible moderation event (developer/admin notification).
 * Persisted in ModerationEvent collection — surfaced in Admin Safety Moderation UI.
 */
async function createModerationEvent({
  eventType,
  reporterId,
  reportedUserId = null,
  reportId = null,
  targetVideoId = null,
  reason = null,
  metadata = {}
}) {
  const event = await ModerationEvent.create({
    eventType,
    reporterId,
    reportedUserId,
    reportId,
    targetVideoId,
    reason,
    metadata
  });

  console.info('[ModerationEvent]', {
    eventType,
    eventId: event._id.toString(),
    reporterId: reporterId?.toString?.() || reporterId,
    reportedUserId: reportedUserId?.toString?.() || reportedUserId,
    targetVideoId: targetVideoId?.toString?.() || targetVideoId,
    reason,
    createdAt: event.createdAt
  });

  return event;
}

async function getBlockedUserIds(blockerId) {
  if (!blockerId) return [];
  const blocks = await UserBlock.find({ blockerId }).select('blockedUserId').lean();
  return blocks.map((b) => b.blockedUserId);
}

/**
 * Apply blocked-user exclusion to a Studio/reel query object (mutates & returns query).
 */
function applyBlockFilterToQuery(query, blockedUserIds) {
  if (!blockedUserIds || blockedUserIds.length === 0) return query;
  query.uploadedBy = { ...(query.uploadedBy || {}), $nin: blockedUserIds };
  return query;
}

async function createContentReport({ reporterId, targetType, targetId, reason, description }) {
  if (!targetType || targetType !== 'video') {
    const err = new Error('Invalid target type');
    err.status = 400;
    throw err;
  }

  if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
    const err = new Error('Invalid video ID');
    err.status = 400;
    throw err;
  }

  if (!reason || !REPORT_REASONS.includes(reason)) {
    const err = new Error('Invalid report reason');
    err.status = 400;
    throw err;
  }

  const reel = await Reel.findById(targetId);
  if (!reel) {
    const err = new Error('Video not found');
    err.status = 404;
    throw err;
  }

  const reportedUserId = reel.uploadedBy;

  if (reportedUserId.toString() === reporterId.toString() && reel.userModel === 'User') {
    const err = new Error('You cannot report your own content');
    err.status = 400;
    throw err;
  }

  const existing = await ContentReport.findOne({
    reporterId,
    targetType: 'video',
    targetId,
    status: { $in: ['pending', 'reviewing'] }
  });

  if (existing) {
    return {
      report: existing,
      alreadyReported: true,
      message: 'Report already submitted and pending review'
    };
  }

  const report = await ContentReport.create({
    reporterId,
    targetType: 'video',
    targetId,
    reportedUserId,
    reason,
    description: (description || '').trim().slice(0, 1000),
    status: 'pending'
  });

  await createModerationEvent({
    eventType: 'CONTENT_REPORTED',
    reporterId,
    reportedUserId,
    reportId: report._id,
    targetVideoId: targetId,
    reason,
    metadata: {
      reasonLabel: REASON_LABELS[reason] || reason,
      username: reel.username,
      hasDescription: Boolean((description || '').trim())
    }
  });

  return {
    report,
    alreadyReported: false,
    message: "Thanks. We've received your report and will review it."
  };
}

async function resolveBlockTarget({ blockedUserId, relatedVideoId = null }) {
  const targetUser = await User.findById(blockedUserId).select('_id name').lean();
  if (targetUser) {
    return {
      id: targetUser._id,
      displayName: targetUser.name || null,
      accountType: 'User'
    };
  }

  // Studio reels can be uploaded by Admin accounts (userModel: 'Admin')
  const Admin = require('../Models/Admin');
  const targetAdmin = await Admin.findById(blockedUserId).select('_id username name email').lean();
  if (targetAdmin) {
    return {
      id: targetAdmin._id,
      displayName: targetAdmin.name || targetAdmin.username || targetAdmin.email || null,
      accountType: 'Admin'
    };
  }

  // Fallback: related reel proves this ID is a real content creator in feed
  if (relatedVideoId && mongoose.Types.ObjectId.isValid(relatedVideoId)) {
    const reel = await Reel.findById(relatedVideoId).select('uploadedBy username userModel').lean();
    if (reel && reel.uploadedBy && reel.uploadedBy.toString() === blockedUserId.toString()) {
      return {
        id: reel.uploadedBy,
        displayName: reel.username || null,
        accountType: reel.userModel || 'User'
      };
    }
  }

  return null;
}

async function blockUser({ blockerId, blockedUserId, relatedVideoId = null }) {
  if (!blockedUserId || !mongoose.Types.ObjectId.isValid(blockedUserId)) {
    const err = new Error('Invalid user ID');
    err.status = 400;
    throw err;
  }

  if (blockerId.toString() === blockedUserId.toString()) {
    const err = new Error('You cannot block yourself');
    err.status = 400;
    throw err;
  }

  const target = await resolveBlockTarget({ blockedUserId, relatedVideoId });
  if (!target) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  let block = await UserBlock.findOne({ blockerId, blockedUserId });
  let alreadyBlocked = false;

  if (block) {
    alreadyBlocked = true;
  } else {
    try {
      block = await UserBlock.create({ blockerId, blockedUserId });
    } catch (e) {
      if (e && e.code === 11000) {
        block = await UserBlock.findOne({ blockerId, blockedUserId });
        alreadyBlocked = true;
      } else {
        throw e;
      }
    }
  }

  if (!alreadyBlocked) {
    await createModerationEvent({
      eventType: 'USER_BLOCKED_FOR_SAFETY',
      reporterId: blockerId,
      reportedUserId: blockedUserId,
      targetVideoId: relatedVideoId && mongoose.Types.ObjectId.isValid(relatedVideoId)
        ? relatedVideoId
        : null,
      reason: 'user_block',
      metadata: {
        blockedUserName: target.displayName,
        blockedAccountType: target.accountType
      }
    });
  }

  return {
    blockedUserId: blockedUserId.toString(),
    isBlocked: true,
    alreadyBlocked,
    message: alreadyBlocked ? 'User is already blocked' : 'User blocked successfully'
  };
}

async function unblockUser({ blockerId, blockedUserId }) {
  if (!blockedUserId || !mongoose.Types.ObjectId.isValid(blockedUserId)) {
    const err = new Error('Invalid user ID');
    err.status = 400;
    throw err;
  }

  const result = await UserBlock.findOneAndDelete({ blockerId, blockedUserId });
  return {
    blockedUserId: blockedUserId.toString(),
    isBlocked: false,
    wasBlocked: Boolean(result),
    message: result ? 'User unblocked successfully' : 'User was not blocked'
  };
}

module.exports = {
  REPORT_REASONS,
  REASON_LABELS,
  createModerationEvent,
  getBlockedUserIds,
  applyBlockFilterToQuery,
  createContentReport,
  blockUser,
  unblockUser
};
