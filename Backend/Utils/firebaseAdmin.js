const admin = require('firebase-admin');
const path = require('path');

try {
  const serviceAccount = require('../config/firebase-service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('🔥 Firebase Admin SDK Initialized Successfully');
} catch (error) {
  console.error('❌ Firebase Admin SDK Initialization Failed:', error.message);
}

/**
 * Send a push notification to a specific user
 * @param {string} userId 
 * @param {object} payload { title, body, data }
 */
const sendNotificationToUser = async (userId, payload) => {
  try {
    const User = require('../Models/User');
    const user = await User.findById(userId);
    if (!user) {
      console.log(`📡 User ${userId} not found`);
      return;
    }

    const webTokens = user.fcmWebTokens || [];
    const mobileTokens = user.fcmMobileTokens || [];
    const allTokens = [...webTokens, ...mobileTokens];

    if (allTokens.length === 0) {
      console.log(`📡 No FCM tokens registered for user ${userId}`);
      return;
    }

    const { title, body, data } = payload;
    const messagePayload = {
      notification: { title, body },
      data: data || {}
    };

    console.log(`📡 Sending push notification to user ${userId} on ${allTokens.length} device(s)...`);
    
    const sendPromises = allTokens.map(token => 
      admin.messaging().send({
        token,
        ...messagePayload
      }).catch(err => {
        console.error(`❌ Failed to send notification to token: ${token.substring(0, 15)}...`, err.message);
        // Clean up invalid/inactive tokens from database
        if (
          err.code === 'messaging/invalid-argument' ||
          err.code === 'messaging/invalid-registration-token' ||
          err.code === 'messaging/registration-token-not-registered'
        ) {
          User.findByIdAndUpdate(userId, { 
            $pull: { 
              fcmWebTokens: token,
              fcmMobileTokens: token
            } 
          }).catch(dbErr => {
            console.error('❌ Failed to clean up invalid token:', dbErr.message);
          });
        }
      })
    );

    await Promise.all(sendPromises);
  } catch (err) {
    console.error('❌ Error sending notification:', err.message);
  }
};

module.exports = {
  admin,
  sendNotificationToUser
};
