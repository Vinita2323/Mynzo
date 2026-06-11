const Order = require('../Models/Order');
const Cart = require('../Models/Cart');
const Coupon = require('../Models/Coupon');
const Product = require('../Models/Product');
const User = require('../Models/User');
const shiprocketService = require('../Utils/shiprocketService');
// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, total, deliveryAddress, paymentMethod, paymentStatus, paymentId, couponCode } = req.body;

    if (!items || items.length === 0 || !total || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
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
      couponCode: couponCode || null
    });

    // Send order to Shiprocket
    try {
      const user = await User.findById(req.user._id);
      
      const shiprocketOrderData = {
        order_id: `ORD_${order._id}`,
        order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        pickup_location: 'Primary', // Must be configured in Shiprocket dashboard
        billing_customer_name: user.name || deliveryAddress.name || 'Customer',
        billing_last_name: '',
        billing_address: deliveryAddress.address,
        billing_city: 'City', // Consider adding city/state to deliveryAddress in future
        billing_pincode: deliveryAddress.pincode,
        billing_state: 'State',
        billing_country: 'India',
        billing_email: user.email || 'customer@mynzo.com',
        billing_phone: user.phone || '9999999999',
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
        weight: 0.5
      };

      const srResponse = await shiprocketService.createShiprocketOrder(shiprocketOrderData);
      if (srResponse && srResponse.order_id) {
        order.shiprocketOrderId = srResponse.order_id;
        order.shipmentId = srResponse.shipment_id;
        await order.save();
      }
    } catch (srError) {
      console.error('Shiprocket order creation failed, will need manual sync:', srError.message);
    }

    // Update product sales and stock
    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: {
            sales: item.quantity || 1,
            stock: -(item.quantity || 1)
          }
        });
      }
    }

    // If coupon was used, increment usage count
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase().trim() },
        { $inc: { usage: 1 } }
      );
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

// @desc    Get logged in user's orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
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
// @route   GET /api/orders/:id
// @access  Private
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

