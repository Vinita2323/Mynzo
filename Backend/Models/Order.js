const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String }
    }
  ],
  total: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    name: { type: String, required: true },
    type: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  couponCode: {
    type: String,
    default: null
  },
  shiprocketOrderId: {
    type: String,
    default: null
  },
  shipmentId: {
    type: String,
    default: null
  },
  awbCode: {
    type: String,
    default: null
  },
  courierName: {
    type: String,
    default: null
  },
  shipmentStatus: {
    type: String,
    default: null
  },
  pickupScheduled: {
    type: Boolean,
    default: false
  },
  trackingHistory: [
    {
      status: String,
      timestamp: Date,
      location: String,
      activity: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
