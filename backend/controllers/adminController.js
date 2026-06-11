const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// ─── Approve Payment ──────────────────────────────────────────────────────────
// PUT /api/admin/payment/approve/:orderId  [Admin Only]
const approvePayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      'user',
      'name email'
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already approved for this order.',
      });
    }

    if (!order.paymentProof) {
      return res.status(400).json({
        success: false,
        message: 'No payment proof uploaded for this order yet.',
      });
    }

    order.paymentStatus = 'Approved';
    order.orderStatus = 'Payment Approved'; // Must be manual, not automatic
    order.adminRemarks = req.body.remarks || null;

    await order.save();

    res.status(200).json({
      success: true,
      message: `Payment approved for order ${order.orderNumber}.`,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        user: order.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Reject Payment ───────────────────────────────────────────────────────────
// PUT /api/admin/payment/reject/:orderId  [Admin Only]
const rejectPayment = async (req, res, next) => {
  try {
    const { remarks } = req.body;

    const order = await Order.findById(req.params.orderId).populate(
      'user',
      'name email'
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already approved payment.',
      });
    }

    order.paymentStatus = 'Rejected';
    order.adminRemarks = remarks || 'Payment rejected by admin.';

    await order.save();

    res.status(200).json({
      success: true,
      message: `Payment rejected for order ${order.orderNumber}.`,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        adminRemarks: order.adminRemarks,
        user: order.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Order Status ──────────────────────────────────────────────────────
// PUT /api/admin/orders/:orderId/status  [Admin Only]
// Allows manual progression through order stages after payment approval.
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const validStatuses = [
      'Pending Payment',
      'Payment Approved',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled',
    ];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // ── Business Rule: Prevent moving to Processing without approval ──────────
    if (
      orderStatus === 'Processing' &&
      order.paymentStatus !== 'Approved'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot move to Processing. Payment must be approved first.',
      });
    }

    // Allow Cancelled from any state
    order.orderStatus = orderStatus;
    if (req.body.adminRemarks) {
      order.adminRemarks = req.body.adminRemarks;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${orderStatus}".`,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────
// GET /api/admin/orders  [Admin Only]
const getAdminOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      orderStatus,
      paymentStatus,
      search,
    } = req.query;

    const filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) filter.orderNumber = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Users (Admin) ────────────────────────────────────────────────────
// GET /api/admin/users  [Admin Only]
const getAdminUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle User Active Status (Admin) ───────────────────────────────────────
// PUT /api/admin/users/:userId/toggle  [Admin Only]
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be deactivated.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Products (Admin) ─────────────────────────────────────────────────
// GET /api/admin/products  [Admin Only]
const getAdminProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, isActive, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'categoryName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Dashboard Stats (Admin) ──────────────────────────────────────────────────
// GET /api/admin/dashboard  [Admin Only]
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all aggregations in parallel for performance
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingPayments,
      approvedPayments,
      revenueResult,
      orderStatusBreakdown,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({}),
      Order.countDocuments({ paymentStatus: 'Pending' }),
      Order.countDocuments({ paymentStatus: 'Approved' }),
      // Total revenue from approved payments only
      Order.aggregate([
        { $match: { paymentStatus: 'Approved' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      // Order status breakdown
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Recent 5 orders
      Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber totalAmount paymentStatus orderStatus createdAt user'),
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Format order status breakdown
    const statusBreakdown = {};
    orderStatusBreakdown.forEach((s) => {
      statusBreakdown[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingPayments,
        approvedPayments,
        rejectedPayments: await Order.countDocuments({ paymentStatus: 'Rejected' }),
        revenue: parseFloat(revenue.toFixed(2)),
        orderStatusBreakdown: statusBreakdown,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  approvePayment,
  rejectPayment,
  updateOrderStatus,
  getAdminOrders,
  getAdminUsers,
  toggleUserStatus,
  getAdminProducts,
  getDashboardStats,
};
