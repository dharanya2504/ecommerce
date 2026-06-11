const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const generateOrderNumber = require('../utils/generateOrderNumber');

// ─── Create Order ─────────────────────────────────────────────────────────────
// POST /api/orders/create  [Protected]
// Creates an order from the user's cart, decrements stock, clears cart.
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // Fetch user's cart with product details
    const cart = await Cart.findOne({ user: userId }).populate(
      'items.product',
      'productName price stock isActive'
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Add items before placing an order.',
      });
    }

    // Validate all items and compute totals
    const orderProducts = [];
    let totalAmount = 0;
    const stockUpdates = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${product?.productName || 'Unknown'}" is no longer available.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.productName}". Only ${product.stock} unit(s) left.`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      // Snapshot the product details at time of order
      orderProducts.push({
        product: product._id,
        productName: product.productName,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: product.price,
      });

      // Collect stock updates
      stockUpdates.push({
        id: product._id,
        newStock: product.stock - item.quantity,
      });
    }

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    // Ensure uniqueness (extremely rare collision, but be safe)
    const existingOrder = await Order.findOne({ orderNumber });
    if (existingOrder) {
      orderNumber = generateOrderNumber();
    }

    // Create the order
    const order = await Order.create({
      orderNumber,
      user: userId,
      products: orderProducts,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      paymentStatus: 'Pending',
      orderStatus: 'Pending Payment',
      shippingAddress: shippingAddress || {},
    });

    // Update stock for all products
    for (const update of stockUpdates) {
      await Product.findByIdAndUpdate(update.id, { stock: update.newStock });
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Please complete payment.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Orders ────────────────────────────────────────────────────────────
// GET /api/orders/my-orders  [Protected]
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, orderStatus, paymentStatus } = req.query;

    const filter = { user: req.user._id };
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
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

// ─── Get Order By ID ──────────────────────────────────────────────────────────
// GET /api/orders/:id  [Protected - Owner or Admin]
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email phone'
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Restrict: Only the order owner or admin can view
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.',
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
