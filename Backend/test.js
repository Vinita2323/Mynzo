require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Models/User');

mongoose.connect(process.env.MONGODB_URL)
  .then(async () => {
    const users = await User.find({});
    const multipleTokens = users.filter(u => {
      const w = u.fcmWebTokens || [];
      const m = u.fcmMobileTokens || [];
      const total = new Set([...w, ...m]).size;
      return total > 1;
    });
    const Notification = require('./Models/Notification');
    const notifs = await Notification.find({}).sort({ createdAt: -1 }).limit(3);
    console.log('Last 3 notifications:', notifs.map(n => ({ title: n.title, time: n.createdAt, target: n.target })));
    process.exit(0);
  });
