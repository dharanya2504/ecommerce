const express = require('express');
const router = express.Router();
const {
  approvePayment,
  rejectPayment,
  updateOrderStatus,
  getAdminOrders,
  getAdminUsers,
  toggleUserStatus,
  getAdminProducts,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication AND admin role
router.use(protect, admin);

// ─── Dashboard ────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
router.get('/dashboard', getDashboardStats);

// ─── Order Management ─────────────────────────────────────────────────────────
// GET /api/admin/orders
router.get('/orders', getAdminOrders);

// PUT /api/admin/orders/:orderId/status
router.put('/orders/:orderId/status', updateOrderStatus);

// ─── Payment Management ───────────────────────────────────────────────────────
// PUT /api/admin/payment/approve/:orderId
router.put('/payment/approve/:orderId', approvePayment);

// PUT /api/admin/payment/reject/:orderId
router.put('/payment/reject/:orderId', rejectPayment);

// ─── User Management ──────────────────────────────────────────────────────────
// GET /api/admin/users
router.get('/users', getAdminUsers);

// PUT /api/admin/users/:userId/toggle
router.put('/users/:userId/toggle', toggleUserStatus);

// ─── Product Management ───────────────────────────────────────────────────────
// GET /api/admin/products
router.get('/products', getAdminProducts);

module.exports = router;
