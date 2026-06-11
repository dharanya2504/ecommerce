const { body } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validateRequest } = require('../middleware/validateMiddleware');

// ─── Validation Rules ─────────────────────────────────────────────────────────
const addToCartValidation = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid Product ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validateRequest,
];

// ─── Add to Cart ──────────────────────────────────────────────────────────────
// POST /api/cart/add  [Protected]
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const userId = req.user._id;

    // Validate product exists and is available
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) available in stock.`,
      });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if the same product+size+color combination already exists
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === (size || '') &&
        item.color === (color || '')
    );

    if (existingItemIndex > -1) {
      // Increment quantity
      const newQuantity = cart.items[existingItemIndex].quantity + parseInt(quantity);
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than ${product.stock} unit(s) of this item.`,
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity: parseInt(quantity),
        size: size || '',
        color: color || '',
      });
    }

    await cart.save();
    await cart.populate('items.product', 'productName price images stock');

    res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Cart ─────────────────────────────────────────────────────────────────
// GET /api/cart  [Protected]
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'productName price images stock isActive'
    );

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty.',
        cart: { items: [], totalItems: 0, totalPrice: 0 },
      });
    }

    // Calculate total
    const totalPrice = cart.items.reduce((sum, item) => {
      if (item.product && item.product.isActive) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      cart,
      totalItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Cart Item ─────────────────────────────────────────────────────────
// PUT /api/cart/update  [Protected]
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and valid quantity are required.',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    // Check stock
    const product = await Product.findById(item.product);
    if (!product || product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product ? product.stock : 0} unit(s) available in stock.`,
      });
    }

    item.quantity = parseInt(quantity);
    await cart.save();
    await cart.populate('items.product', 'productName price images stock');

    res.status(200).json({
      success: true,
      message: 'Cart item updated.',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Remove from Cart ─────────────────────────────────────────────────────────
// DELETE /api/cart/remove  [Protected]
const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Item ID is required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const itemExists = cart.items.id(itemId);
    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Clear Cart ───────────────────────────────────────────────────────────────
// DELETE /api/cart/clear  [Protected]
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addToCartValidation,
};
