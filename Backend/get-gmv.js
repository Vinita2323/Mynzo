const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./Models/Order');

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const gmvRes = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' }, deliveryCharges: { $sum: '$deliveryCharge' }, count: { $sum: 1 } } }
  ]);
  console.log('GMV calculation:', JSON.stringify(gmvRes, null, 2));

  const netRevenueRes = await Order.aggregate([
    { $match: { paymentStatus: 'Paid', status: { $nin: ['Cancelled', 'Refunded', 'Returned'] } } },
    { $group: { _id: null, total: { $sum: '$total' }, deliveryCharges: { $sum: '$deliveryCharge' }, count: { $sum: 1 } } }
  ]);
  console.log('Net Revenue calculation:', JSON.stringify(netRevenueRes, null, 2));

  process.exit(0);
});
