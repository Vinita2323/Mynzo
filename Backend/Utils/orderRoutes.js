const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus, getUserOrderById } = require('../Controllers/orderController');
const { protectUser } = require('../Middlewares/userAuthMiddleware');
const { protectAdmin } = require('../Middlewares/authMiddleware');

// User routes
router.route('/')
  .get(protectUser, getUserOrders)
  .post(protectUser, createOrder);

router.route('/:id')
  .get(protectUser, getUserOrderById);

// Admin routes
router.route('/admin/all')
  .get(protectAdmin, getAllOrders);

router.route('/admin/:id/status')
  .put(protectAdmin, updateOrderStatus);

module.exports = router;
