const mongoose = require('mongoose');

/**
 * Admin/developer-visible safety events.
 * Created when a user reports content or blocks another user for safety.
 * Visible in Admin Frontend → Content → Safety Moderation.
 */
const moderationEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['CONTENT_REPORTED', 'USER_BLOCKED_FOR_SAFETY'],
    required: true,
    index: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentReport',
    default: null
  },
  targetVideoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel',
    default: null
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reason: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

moderationEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ModerationEvent', moderationEventSchema);
