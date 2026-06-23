const Coupon = require('../Models/Coupon');

// @desc Get all coupons
// @route GET /api/admin/promotions/coupons
// @access Public (or Admin protected)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch coupons'
    });
  }
};

// @desc Create a new coupon
// @route POST /api/admin/promotions/coupons
// @access Private (Admin only)
exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrder, usageLimit, expiry } = req.body;

    if (!code || !value || !expiry) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code, discount value, and expiry date.'
      });
    }

    const uppercaseCode = code.toUpperCase().trim();

    // Check if code already exists
    const existing = await Coupon.findOne({ code: uppercaseCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon with code ${uppercaseCode} already exists.`
      });
    }

    const coupon = await Coupon.create({
      code: uppercaseCode,
      type,
      value: Number(value),
      minOrder: minOrder ? Number(minOrder) : 0,
      usageLimit: usageLimit ? Number(usageLimit) : 1,
      expiry: new Date(expiry),
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Coupon published successfully',
      coupon
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to publish coupon'
    });
  }
};

// @desc Toggle coupon status (Active/Paused)
// @route PUT /api/admin/promotions/coupons/:id/status
// @access Private (Admin only)
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Paused', 'Expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be Active, Paused, or Expired.'
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Coupon status updated to ${status}`,
      coupon
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to update coupon status'
    });
  }
};

// @desc Delete a coupon
// @route DELETE /api/admin/promotions/coupons/:id
// @access Private (Admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to delete coupon'
    });
  }
};

// @desc Update a coupon
// @route PUT /api/admin/promotions/coupons/:id
// @access Private (Admin only)
exports.updateCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrder, usageLimit, expiry } = req.body;

    const uppercaseCode = code ? code.toUpperCase().trim() : undefined;

    if (uppercaseCode) {
      // Check if another coupon has the same code
      const existing = await Coupon.findOne({ code: uppercaseCode, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Coupon with code ${uppercaseCode} already exists.`
        });
      }
    }

    const updatedData = {
      ...(uppercaseCode && { code: uppercaseCode }),
      ...(type && { type }),
      ...(value !== undefined && { value: Number(value) }),
      ...(minOrder !== undefined && { minOrder: Number(minOrder) }),
      ...(usageLimit !== undefined && { usageLimit: Number(usageLimit) }),
      ...(expiry && { expiry: new Date(expiry) })
    };

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to update coupon'
    });
  }
};

// @desc Validate a coupon code
// @route POST /api/admin/promotions/coupons/validate
// @access Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a coupon code.'
      });
    }

    const uppercaseCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: uppercaseCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code.'
      });
    }

    if (coupon.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This coupon is no longer active.'
      });
    }

    // Check expiry
    if (new Date(coupon.expiry) < new Date()) {
      if (coupon.status !== 'Expired') {
        coupon.status = 'Expired';
        await coupon.save();
      }
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired.'
      });
    }

    // Check minimum order amount
    if (orderAmount !== undefined && orderAmount < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrder} is required.`
      });
    }

    // Check usage limit
    if (coupon.usage >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This coupon usage limit has been reached.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon validated successfully!',
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        usageLimit: coupon.usageLimit,
        usage: coupon.usage
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to validate coupon'
    });
  }
};

exports.getUserCouponHistory = async (req, res) => {
  try {
    const Order = require('../Models/Order');
    const Coupon = require('../Models/Coupon');

    const orders = await Order.find({ 
      userId: req.user._id, 
      couponCode: { $ne: null } 
    }).sort({ createdAt: -1 }).lean();

    const codes = [...new Set(orders.map(o => o.couponCode.toUpperCase().trim()))];
    const coupons = await Coupon.find({ code: { $in: codes } }).lean();
    const couponMap = Object.fromEntries(coupons.map(c => [c.code, c]));

    const history = orders.map((order) => {
      const coupon = couponMap[order.couponCode.toUpperCase().trim()];
      return {
        orderId: order._id,
        date: order.createdAt,
        code: order.couponCode,
        discount: coupon ? (coupon.type === 'Percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`) : 'Discount Applied',
        desc: coupon ? `Applied on order above ₹${coupon.minOrder}` : 'Applied on order',
        total: order.total
      };
    });

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    console.error('Coupon history error:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch coupon history'
    });
  }
};


