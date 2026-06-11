const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order routes are protected
router.use(protect);

// POST /api/orders/create
router.post('/create', createOrder);

// GET /api/orders/my-orders
router.get('/my-orders', getMyOrders);

// GET /api/orders/:id
router.get('/:id', getOrderById);

module.exports = router;
