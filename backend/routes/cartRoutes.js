const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addToCartValidation,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes are protected (require login)
router.use(protect);

// POST /api/cart/add
router.post('/add', addToCartValidation, addToCart);

// GET /api/cart
router.get('/', getCart);

// PUT /api/cart/update
router.put('/update', updateCartItem);

// DELETE /api/cart/remove
router.delete('/remove', removeFromCart);

// DELETE /api/cart/clear
router.delete('/clear', clearCart);

module.exports = router;
