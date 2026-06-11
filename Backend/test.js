require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  const User = require('./Models/User');
  
  // Get the first user
  const user = await User.findOne({});
  console.log('User tokenVersion in DB:', user.tokenVersion);

  // Sign an old token without tokenVersion
  const oldToken = jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET);
  const decodedOld = jwt.verify(oldToken, process.env.JWT_SECRET);
  
  console.log('Old token decoded tokenVersion:', decodedOld.tokenVersion);
  console.log('Does old token mismatch?', decodedOld.tokenVersion !== user.tokenVersion);

  // Sign a new token
  const newToken = jwt.sign({ id: user._id, phone: user.phone, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET);
  const decodedNew = jwt.verify(newToken, process.env.JWT_SECRET);

  console.log('New token decoded tokenVersion:', decodedNew.tokenVersion);
  console.log('Does new token mismatch?', decodedNew.tokenVersion !== user.tokenVersion);

  process.exit(0);
}
run();
