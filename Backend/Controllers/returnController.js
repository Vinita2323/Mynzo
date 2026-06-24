const ReturnRequest = require('../Models/ReturnRequest');
const Order = require('../Models/Order');
const Product = require('../Models/Product');
const CoinTransaction = require('../Models/CoinTransaction');
const shiprocketService = require('../Router/shiprocketService');

// @desc    Create a return request (User)
// @route   POST /returns
// @access  Private (User)
exports.createReturnRequest = async (req, res) => {
  try {
    const { orderId, items, reason, reasonDetails, images } = req.body;

    if (!orderId || !items || items.length === 0 || !reason) {
      return res.status(400).json({ success: false, message: 'orderId, items, and reason are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to return this order' });
    }

    // Only delivered orders can be returned
    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
    }

    // Check if a return request already exists for this order
    const existingReturn = await ReturnRequest.findOne({ orderId, status: { $nin: ['Rejected'] } });
    if (existingReturn) {
      return res.status(400).json({ success: false, message: 'A return request already exists for this order' });
    }

    // Calculate refund amount from selected items
    const refundAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const returnRequest = await ReturnRequest.create({
      orderId,
      userId: req.user._id,
      items,
      reason,
      reasonDetails: reasonDetails || '',
      refundAmount,
      images: images || [],
      status: 'Requested'
    });

    // Update order status
    order.status = 'Return Requested';
    await order.save();

    res.status(201).json({ success: true, message: 'Return request submitted successfully', returnRequest });
  } catch (error) {
    console.error('Error creating return request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's return requests
// @route   GET /returns
// @access  Private (User)
exports.getUserReturns = async (req, res) => {
  try {
    const returns = await ReturnRequest.find({ userId: req.user._id })
      .populate('orderId', 'status total createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, returns });
  } catch (error) {
    console.error('Error fetching user returns:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all return requests (Admin)
// @route   GET /returns/admin/all
// @access  Private (Admin)
exports.getAllReturns = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    // Build the base query
    let returns, total;

    if (search) {
      // Search by return ID or populated fields — use aggregation
      const searchRegex = new RegExp(search, 'i');
      
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'order'
          }
        },
        { $unwind: '$order' },
        {
          $match: {
            $or: [
              { 'user.name': searchRegex },
              { 'user.phone': searchRegex },
              { 'user.email': searchRegex },
              { reason: searchRegex }
            ]
          }
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  orderId: '$order._id',
                  orderTotal: '$order.total',
                  orderCreatedAt: '$order.createdAt',
                  userId: '$user._id',
                  userName: '$user.name',
                  userPhone: '$user.phone',
                  userEmail: '$user.email',
                  items: 1,
                  reason: 1,
                  reasonDetails: 1,
                  status: 1,
                  refundAmount: 1,
                  refundMethod: 1,
                  adminNotes: 1,
                  images: 1,
                  createdAt: 1,
                  updatedAt: 1
                }
              }
            ]
          }
        }
      ];

      const result = await ReturnRequest.aggregate(pipeline);
      returns = result[0].data;
      total = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    } else {
      [returns, total] = await Promise.all([
        ReturnRequest.find(query)
          .populate('userId', 'name email phone')
          .populate('orderId', 'total createdAt status')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ReturnRequest.countDocuments(query)
      ]);
    }

    // Get stats
    const [requestedCount, approvedCount, refundedToday, allReturns] = await Promise.all([
      ReturnRequest.countDocuments({ status: 'Requested' }),
      ReturnRequest.countDocuments({ status: 'Approved' }),
      ReturnRequest.countDocuments({
        status: 'Refunded',
        updatedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      ReturnRequest.find({ status: 'Refunded' }).select('createdAt updatedAt').lean()
    ]);

    // Calculate average resolution time
    let avgResolutionDays = 0;
    if (allReturns.length > 0) {
      const totalDays = allReturns.reduce((sum, r) => {
        const diff = new Date(r.updatedAt) - new Date(r.createdAt);
        return sum + (diff / (1000 * 60 * 60 * 24));
      }, 0);
      avgResolutionDays = (totalDays / allReturns.length).toFixed(1);
    }

    // Get total refunded today amount
    const refundedTodayData = await ReturnRequest.find({
      status: 'Refunded',
      updatedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }).select('refundAmount').lean();
    const refundedTodayAmount = refundedTodayData.reduce((sum, r) => sum + r.refundAmount, 0);

    res.status(200).json({
      success: true,
      count: returns.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      returns,
      stats: {
        requestedCount,
        approvedCount,
        refundedTodayAmount,
        avgResolutionDays
      }
    });
  } catch (error) {
    console.error('Error fetching all returns:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single return request by ID (Admin)
// @route   GET /returns/admin/:id
// @access  Private (Admin)
exports.getReturnById = async (req, res) => {
  try {
    const returnRequest = await ReturnRequest.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('orderId', 'total createdAt status paymentMethod paymentStatus deliveryAddress items');

    if (!returnRequest) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    res.status(200).json({ success: true, returnRequest });
  } catch (error) {
    console.error('Error fetching return request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update return status (Admin)
// @route   PUT /returns/admin/:id/status
// @access  Private (Admin)
exports.updateReturnStatus = async (req, res) => {
  try {
    const { status, adminNotes, refundAmount } = req.body;

    const returnRequest = await ReturnRequest.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    // Validate status transitions
    const validTransitions = {
      'Requested': ['Approved', 'Rejected'],
      'Approved': ['Pick-up Scheduled'],
      'Pick-up Scheduled': ['Received'],
      'Received': ['Refunded']
    };

    const allowed = validTransitions[returnRequest.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${returnRequest.status}' to '${status}'. Allowed: ${(allowed || []).join(', ') || 'none'}`
      });
    }

    // Update fields
    returnRequest.status = status;
    if (adminNotes !== undefined) returnRequest.adminNotes = adminNotes;
    if (refundAmount !== undefined) returnRequest.refundAmount = refundAmount;

    // Handle Shiprocket return order creation on approval
    if (status === 'Approved') {
      try {
        const order = await Order.findById(returnRequest.orderId).populate('userId');
        if (order) {
          // Calculate weight
          let totalWeight = 0;
          for (const item of returnRequest.items) {
            const product = await Product.findById(item.productId);
            const w = (product && product.shippingSpecs && product.shippingSpecs.weight) ? product.shippingSpecs.weight : 0.5;
            totalWeight += (w * item.quantity);
          }

          const cityState = shiprocketService.parseCityState(order.deliveryAddress.address);

          // Get return shipping address from env or defaults
          const returnShippingAddress = {
            name: process.env.RETURN_SHIPPING_NAME || "Mynzo Warehouse",
            address: process.env.RETURN_SHIPPING_ADDRESS || "Warehouse 12, Sector 63",
            address_2: process.env.RETURN_SHIPPING_ADDRESS_2 || "",
            city: process.env.RETURN_SHIPPING_CITY || "Noida",
            state: process.env.RETURN_SHIPPING_STATE || "Uttar Pradesh",
            country: "India",
            pincode: process.env.SHIPROCKET_PICKUP_PINCODE || "201301",
            phone: process.env.RETURN_SHIPPING_PHONE || "9876543210",
            email: process.env.RETURN_SHIPPING_EMAIL || "warehouse@mynzo.com"
          };

          const returnPayload = {
            order_id: `RET_${returnRequest._id.toString()}`,
            order_date: new Date(returnRequest.createdAt).toISOString().slice(0, 16).replace('T', ' '),
            channel_id: "",
            pickup_customer_name: order.deliveryAddress.name || order.userId?.name || "Customer",
            pickup_last_name: "",
            pickup_address: order.deliveryAddress.address,
            pickup_address_2: "",
            pickup_city: cityState.city,
            pickup_state: cityState.state,
            pickup_country: "India",
            pickup_pincode: order.deliveryAddress.pincode,
            pickup_email: order.userId?.email || "customer@mynzo.com",
            pickup_phone: order.userId?.phone || "9876543210",
            shipping_customer_name: returnShippingAddress.name,
            shipping_last_name: "",
            shipping_address: returnShippingAddress.address,
            shipping_address_2: returnShippingAddress.address_2,
            shipping_city: returnShippingAddress.city,
            shipping_state: returnShippingAddress.state,
            shipping_country: "India",
            shipping_pincode: returnShippingAddress.pincode,
            shipping_phone: returnShippingAddress.phone,
            shipping_email: returnShippingAddress.email,
            order_items: returnRequest.items.map(item => ({
              name: item.name,
              sku: item.productId ? item.productId.toString() : "PRODUCT",
              units: item.quantity,
              selling_price: item.price,
              discount: 0,
              tax: 0,
              hsn: 441122
            })),
            payment_method: "Prepaid",
            sub_total: returnRequest.refundAmount,
            length: 10,
            breadth: 10,
            height: 10,
            weight: totalWeight || 0.5
          };

          const srResponse = await shiprocketService.createShiprocketReturnOrder(returnPayload);
          if (srResponse && srResponse.order_id) {
            returnRequest.shiprocketReturnOrderId = srResponse.order_id;
            returnRequest.shiprocketReturnShipmentId = srResponse.shipment_id;
            // Attempt to assign AWB if shipment ID is generated
            if (srResponse.shipment_id) {
              try {
                const awbResponse = await shiprocketService.assignAWB(srResponse.shipment_id);
                if (awbResponse && awbResponse.response && awbResponse.response.data) {
                  const data = awbResponse.response.data;
                  returnRequest.awbCode = data.awb_code;
                  returnRequest.courierName = data.courier_name;
                }
              } catch (awbErr) {
                console.error("Failed to automatically assign return AWB:", awbErr.message);
              }
            }
          }
        }
      } catch (srError) {
        console.error("Shiprocket return order creation failed:", srError.message);
      }
    }

    // Handle rejection — reset order status back
    if (status === 'Rejected') {
      const order = await Order.findById(returnRequest.orderId);
      if (order && order.status === 'Return Requested') {
        order.status = 'Delivered';
        await order.save();
      }
    }

    // Handle refund processing
    if (status === 'Refunded') {
      const order = await Order.findById(returnRequest.orderId);

      // 1. Restore stock for returned items
      for (const item of returnRequest.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity, sales: -item.quantity }
          });
        }
      }

      // 2. Credit refund to user's wallet via CoinTransaction
      await CoinTransaction.create({
        userId: returnRequest.userId,
        title: `Refund for Return #${returnRequest._id.toString().substring(returnRequest._id.toString().length - 6).toUpperCase()}`,
        amount: returnRequest.refundAmount,
        type: 'earned'
      });

      // 3. Update order
      if (order) {
        // Check if all items are returned
        const returnedQty = returnRequest.items.reduce((sum, i) => sum + i.quantity, 0);
        const orderQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
        
        if (returnedQty >= orderQty) {
          order.status = 'Cancelled'; // Full return
          order.paymentStatus = 'Refunded';
        }
        await order.save();
      }
    }

    await returnRequest.save();

    res.status(200).json({ success: true, message: `Return status updated to ${status}`, returnRequest });
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get return request by order ID (for checking if return exists)
// @route   GET /returns/by-order/:orderId
// @access  Private (User)
exports.getReturnByOrderId = async (req, res) => {
  try {
    const returnRequest = await ReturnRequest.findOne({
      orderId: req.params.orderId,
      userId: req.user._id,
      status: { $nin: ['Rejected'] }
    }).lean();

    res.status(200).json({ success: true, returnRequest: returnRequest || null });
  } catch (error) {
    console.error('Error fetching return by order ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
