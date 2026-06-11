const Notification = require('../Models/Notification');
const User = require('../Models/User');
const { sendNotificationToUser } = require('../Utils/firebaseAdmin');
const mongoose = require('mongoose');

// @desc    Send broadcast notification
// @route   POST /admin/notifications/send
// @access  Private/Admin
exports.sendBroadcast = async (req, res) => {
  try {
    const { title, body, target, targetUserIds } = req.body;

    if (!title || !body || !target) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Prepare notification record
    const notification = new Notification({
      title,
      body,
      target,
      targetUserIds: targetUserIds || [],
      status: 'Pending',
      sentAt: new Date()
    });

    await notification.save();

    let users = [];

    // Determine target audience
    if (target === 'All Users') {
      users = await User.find({}).select('_id fcmWebTokens fcmMobileTokens');
    } else if (target === 'Selected Users') {
      if (!targetUserIds || targetUserIds.length === 0) {
        notification.status = 'Failed';
        await notification.save();
        return res.status(400).json({ success: false, message: 'No users selected' });
      }
      users = await User.find({ _id: { $in: targetUserIds } }).select('_id fcmWebTokens fcmMobileTokens');
    }

    if (users.length === 0) {
      notification.status = 'Failed';
      await notification.save();
      return res.status(404).json({ success: false, message: 'No valid users found for the selected target' });
    }

    const pushPayload = { title, body };
    
    console.log(`[DEBUG] Broadcasting to ${users.length} users. User 0 tokens: Web(${users[0]?.fcmWebTokens?.length}) Mobile(${users[0]?.fcmMobileTokens?.length})`);

    // Send to all fetched users
    const sendPromises = users.map(user => 
      sendNotificationToUser(user._id, pushPayload)
    );

    Promise.allSettled(sendPromises).then(async () => {
      notification.status = 'Delivered';
      await notification.save();
    });

    res.status(200).json({ 
      success: true, 
      message: `Notification broadcast initiated to ${users.length} user(s).`,
      notification 
    });

  } catch (error) {
    console.error('Send Broadcast Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all broadcast notifications history
// @route   GET /admin/notifications
// @access  Private/Admin
exports.getHistory = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .populate('targetUserIds', 'name email phone');

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Get Notification History Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
