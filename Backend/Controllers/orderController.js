const Order = require('../Models/Order');
const Cart = require('../Models/Cart');
const Coupon = require('../Models/Coupon');
const Product = require('../Models/Product');
const User = require('../Models/User');
const shiprocketService = require('../Router/shiprocketService');
// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, total, deliveryAddress, paymentMethod, paymentStatus, paymentId, couponCode, deliveryCharge, etd } = req.body;

    if (!items || items.length === 0 || !total || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Verify and decrement stock atomically BEFORE creating the order
    const decrementedProducts = [];
    let totalOrderWeight = 0;
    try {
      for (const item of items) {
        if (item.productId) {
          const qty = item.quantity || 1;
          const result = await Product.findOneAndUpdate(
            { 
              _id: item.productId, 
              stock: { $gte: qty } // only if enough stock exists
            },
            { 
              $inc: { 
                stock: -qty, 
                sales: qty 
              } 
            },
            { new: true }
          );
          if (!result) {
            throw new Error(`"${item.name}" is out of stock or does not have enough quantity.`);
          }
          decrementedProducts.push({ productId: item.productId, quantity: qty });
          
          const productWeight = (result.shippingSpecs && result.shippingSpecs.weight) ? result.shippingSpecs.weight : 0.5;
          totalOrderWeight += (productWeight * qty);
        }
      }

      // If coupon was used, validate and increment usage count atomically
      if (couponCode) {
        const coupon = await Coupon.findOneAndUpdate(
          {
            code: couponCode.toUpperCase().trim(),
            status: 'Active',
            expiry: { $gt: new Date() },
            $expr: { $lt: ['$usage', '$usageLimit'] }
          },
          { $inc: { usage: 1 } },
          { new: true }
        );
        if (!coupon) {
          throw new Error('Invalid, expired, or fully used coupon.');
        }
      }
    } catch (err) {
      // Rollback stock decrement for completed items in this loop
      for (const rolledBack of decrementedProducts) {
        await Product.findByIdAndUpdate(rolledBack.productId, {
          $inc: { 
            stock: rolledBack.quantity, 
            sales: -rolledBack.quantity 
          }
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    const order = await Order.create({
      userId: req.user._id,
      items,
      total,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentStatus || 'Pending',
      paymentId: paymentId || '',
      status: paymentMethod === 'Online' && paymentStatus !== 'Paid' ? 'Pending' : 'Processing',
      couponCode: couponCode || null,
      deliveryCharge: deliveryCharge || 0,
      etd: etd || ''
    });

    // Send order to Shiprocket
    try {
      const user = await User.findById(req.user._id);
      
      const cityState = shiprocketService.parseCityState(deliveryAddress.address);

      const shiprocketOrderData = {
        order_id: `ORD_${order._id}`,
        order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Home',
        billing_customer_name: user.name || deliveryAddress.name || 'Customer',
        billing_last_name: '',
        billing_address: deliveryAddress.address,
        billing_city: cityState.city,
        billing_pincode: deliveryAddress.pincode,
        billing_state: cityState.state,
        billing_country: 'India',
        billing_email: user.email || 'customer@mynzo.com',
        billing_phone: user.phone || '9876543210',
        shipping_is_billing: true,
        order_items: items.map(item => ({
            name: item.name,
            sku: item.productId.toString(),
            units: item.quantity || 1,
            selling_price: item.price,
            discount: 0,
            tax: 0,
            hsn: 441122
        })),
        payment_method: paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        sub_total: total,
        length: 10,
        breadth: 10,
        height: 10,
        weight: totalOrderWeight || 0.5
      };

      const srResponse = await shiprocketService.createShiprocketOrder(shiprocketOrderData);
      
      if (srResponse) {
        order.shiprocketResponses.push({ type: 'CREATE_ORDER', data: srResponse });
        if (srResponse.order_id) {
          order.shiprocketOrderId = srResponse.order_id;
          order.shipmentId = srResponse.shipment_id;
        }
      }

      // Fetch delivery charges (serviceability) and store it
      try {
        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '201301';
        const serviceResponse = await shiprocketService.checkServiceability(pickupPincode, deliveryAddress.pincode, totalOrderWeight || 0.5, paymentMethod === 'COD' ? 1 : 0);
        order.shiprocketResponses.push({ type: 'SERVICEABILITY', data: serviceResponse });
        
        if (serviceResponse && serviceResponse.data && serviceResponse.data.available_courier_companies) {
          const couriers = serviceResponse.data.available_courier_companies;
          if (couriers.length > 0) {
            const isCod = paymentMethod === 'COD';
            const calculateTotalFreight = (c) => isCod ? (c.freight_charge + (c.cod_charges || 0)) : c.freight_charge;
            const minFreight = Math.min(...couriers.map(calculateTotalFreight));
            order.deliveryCharge = minFreight;
            
            const bestCourier = couriers.find(c => calculateTotalFreight(c) === minFreight);
            if (bestCourier && bestCourier.etd) {
              order.etd = bestCourier.etd;
            }
          }
        }
      } catch (svcErr) {
        console.error('Serviceability check failed:', svcErr.message);
      }

      await order.save();
    } catch (srError) {
      console.error('Shiprocket order creation failed, will need manual sync:', srError.message);
    }

    // Clear user cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's orders (with pagination)
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ userId: req.user._id })
    ]);

    res.status(200).json({ 
      success: true, 
      count: orders.length, 
      total,
      page,
      pages: Math.ceil(total / limit),
      orders 
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only, with pagination)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({})
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({})
    ]);

    res.status(200).json({ 
      success: true, 
      count: orders.length, 
      total,
      page,
      pages: Math.ceil(total / limit),
      orders 
    });
  } catch (error) {
    console.error("Error fetching all orders for admin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID
exports.getUserOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID (Admin)
// @route   GET /api/orders/admin/:id
// @access  Private/Admin
exports.getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order for admin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track order by ID (Public)
// @route   GET /api/orders/track/:id
// @access  Public
exports.trackOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // We return the order so users can track without being logged in (via SMS/Email link)
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

