const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/admin/auth', require('./Utils/adminAuthRoutes'));
app.use('/auth', require('./Utils/userAuthRoutes'));
app.use('/addresses', require('./Utils/addressRoutes'));
app.use('/cart', require('./Utils/cartRoutes'));
app.use('/orders', require('./Utils/orderRoutes'));
app.use('/referral', require('./Utils/referralRoutes'));
app.use('/games', require('./Utils/gameRoutes'));
app.use('/reels', require('./Utils/reelRoutes'));

app.use('/admin/catalog/chips', require('./Utils/categoryChipRoutes'));
app.use('/admin/catalog/subchips', require('./Utils/subCategoryChipRoutes'));
app.use('/admin/catalog/banners', require('./Utils/bannerRoutes'));
app.use('/admin/catalog/products', require('./Utils/productRoutes'));
app.use('/admin/settings', require('./Utils/settingsRoutes'));
app.use('/admin/promotions/coupons', require('./Utils/couponRoutes'));
app.use('/admin/referrals', require('./Utils/adminReferralRoutes'));
app.use('/admin/content/legal', require('./Utils/legalRoutes'));
app.use('/admin/content/qna', require('./Utils/qnaRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Mynzo API is running 🚀' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
