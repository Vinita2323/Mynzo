const User = require('../Models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, phone) => {
  return jwt.sign(
    { id, phone },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Helper: Get OTP (staging = static, production = random)
const getOtp = () => {
  if (process.env.ENV === 'staging') {
    return process.env.STATIC_OTP || '123456';
  }
  // Production: random 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid phone number required' });
    }

    // Find or create user (auto-register logic)
    let user = await User.findOne({ phone });
    const isNewUser = !user;

    if (!user) {
      user = new User({ phone });
    }

    const otp = getOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // In production, send SMS here
    // For staging, OTP is static - just return success
    console.log(`📱 OTP for ${phone}: ${otp} [ENV: ${process.env.ENV}]`);

    res.status(200).json({
      success: true,
      message: process.env.ENV === 'staging'
        ? `OTP sent (Staging: use ${process.env.STATIC_OTP || '123456'})`
        : 'OTP sent to your phone number',
      isNewUser,
      // Only expose OTP in staging for dev convenience
      ...(process.env.ENV === 'staging' && { otp })
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP and Login/Register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP required' });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please request OTP first.' });
    }

    // Staging: always accept static OTP
    const staticOtp = process.env.STATIC_OTP || '123456';
    const isStaging = process.env.ENV === 'staging';

    if (isStaging && otp === staticOtp) {
      // Staging bypass - accept static OTP
    } else {
      // Check OTP validity
      if (!user.otp || user.otp !== otp) {
        return res.status(401).json({ success: false, message: 'Invalid OTP' });
      }

      if (user.otpExpiry && new Date() > user.otpExpiry) {
        return res.status(401).json({ success: false, message: 'OTP expired. Please request a new one.' });
      }
    }

    // Mark verified, clear OTP
    const isNewUser = !user.isVerified;
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.lastLogin = new Date();

    await user.save();

    const token = generateToken(user._id, user.phone);

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Account created & logged in!' : 'Login successful!',
      isNewUser,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender,
        dob: user.dob,
        joinedAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { sendOtp, verifyOtp, getMe };
