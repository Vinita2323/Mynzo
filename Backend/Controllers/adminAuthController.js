const Admin = require('../Models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Admin Login
// @route   POST /api/admin/auth/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email aur password required hai' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Admin account deactivated hai' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateToken(admin._id, admin.email, admin.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged in admin
// @route   GET /api/admin/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Admin Logout (client-side token removal)
// @route   POST /api/admin/auth/logout
// @access  Private
const adminLogout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logout successful' });
};

// @desc    Get all users (customers)
// @route   GET /api/admin/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const User = require('../Models/User');
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({})
    ]);

    res.status(200).json({ 
      success: true, 
      count: users.length, 
      total,
      page,
      pages: Math.ceil(total / limit),
      users 
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new user (customer)
// @route   POST /api/admin/users
// @access  Private
const createUser = async (req, res) => {
  try {
    const User = require('../Models/User');
    const { name, email, phone, gender, dob } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this phone number already exists' });
    }

    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
    }

    const newUser = new User({
      name: name || null,
      email: email ? email.toLowerCase() : null,
      phone,
      gender: gender || null,
      dob: dob || null,
      isVerified: true
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update admin profile details
// @route   PUT /api/admin/auth/profile
// @access  Private
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (phone !== undefined) admin.phone = phone;
    
    if (req.file) {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      admin.avatar = `${backendUrl}${req.file.url}`;
    } else if (avatar !== undefined) {
      admin.avatar = avatar;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        avatar: admin.avatar,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Update Admin Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/auth/change-password
// @access  Private
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Admin Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Force logout a user
// @route   POST /api/admin/auth/users/:id/force-logout
// @access  Private
const forceLogoutUser = async (req, res) => {
  try {
    const User = require('../Models/User');
    const { sendNotificationToUser } = require('../Utils/firebaseAdmin');

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Increment tokenVersion to invalidate existing JWT sessions
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    // 2. Clear FMC tokens to fully revoke notification access
    const oldWebTokens = user.fcmWebTokens || [];
    const oldMobileTokens = user.fcmMobileTokens || [];
    user.fcmWebTokens = [];
    user.fcmMobileTokens = [];

    await user.save();

    // 3. Send force logout push notification to all OLD tokens
    const pushPayload = {
      notification: {
        title: "Session Expired",
        body: "Your account has been logged out by the administrator."
      },
      data: {
        type: "FORCE_LOGOUT"
      }
    };
    
    // We send directly via admin to the old tokens since we just cleared them from DB
    const { getMessaging } = require('firebase-admin/messaging');
    const { adminApp } = require('../Utils/firebaseAdmin');
    
    const allOldTokens = [...new Set([...oldWebTokens, ...oldMobileTokens])];
    
    if (allOldTokens.length > 0) {
      const sendPromises = allOldTokens.map(token => 
        getMessaging(adminApp).send({
          token,
          ...pushPayload
        }).catch(err => console.log('FCM token already invalid:', err.message))
      );
      
      Promise.allSettled(sendPromises);
    }

    res.status(200).json({ success: true, message: 'User forced logged out successfully' });
  } catch (error) {
    console.error('Force Logout Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Force logout ALL users
// @route   POST /api/admin/auth/users/force-logout-all
// @access  Private
const forceLogoutAllUsers = async (req, res) => {
  try {
    const User = require('../Models/User');
    const users = await User.find({}).select('fcmWebTokens fcmMobileTokens');

    // Collect all tokens to send push notification
    let allOldTokens = [];
    users.forEach(u => {
      if (u.fcmWebTokens) allOldTokens.push(...u.fcmWebTokens);
      if (u.fcmMobileTokens) allOldTokens.push(...u.fcmMobileTokens);
    });
    allOldTokens = [...new Set(allOldTokens)];

    // 1. Increment tokenVersion and clear tokens for ALL users
    await User.updateMany({}, {
      $inc: { tokenVersion: 1 },
      $set: { fcmWebTokens: [], fcmMobileTokens: [] }
    });

    // 2. Send force logout push notification to all OLD tokens
    const pushPayload = {
      notification: {
        title: "Session Expired",
        body: "All user sessions have been terminated by the administrator."
      },
      data: {
        type: "FORCE_LOGOUT"
      }
    };
    
    if (allOldTokens.length > 0) {
      const { getMessaging } = require('firebase-admin/messaging');
      const { adminApp } = require('../Utils/firebaseAdmin');
      
      const sendPromises = allOldTokens.map(token => 
        getMessaging(adminApp).send({
          token,
          ...pushPayload
        }).catch(err => console.log('FCM token already invalid:', err.message))
      );
      
      Promise.allSettled(sendPromises);
    }

    res.status(200).json({ success: true, message: `Successfully forced logout for ${users.length} users.` });
  } catch (error) {
    console.error('Force Logout All Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { adminLogin, getMe, adminLogout, getUsers, createUser, updateAdminProfile, changeAdminPassword, forceLogoutUser, forceLogoutAllUsers };
