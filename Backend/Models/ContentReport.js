const mongoose = require('mongoose');

const REPORT_REASONS = [
  'spam',
  'harassment',
  'hate_speech',
  'violence',
  'inappropriate_content',
  'copyright',
  'other'
];

const contentReportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['video'],
    required: true,
    default: 'video'
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel',
    required: true,
    index: true
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: REPORT_REASONS,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  }
}, { timestamps: true });

contentReportSchema.index({ createdAt: -1 });
contentReportSchema.index({ reporterId: 1, targetType: 1, targetId: 1, status: 1 });

module.exports = mongoose.model('ContentReport', contentReportSchema);
module.exports.REPORT_REASONS = REPORT_REASONS;
