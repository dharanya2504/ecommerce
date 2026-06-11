const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/products  — Public (with query filters)
router.get('/', getProducts);

// GET /api/products/:id  — Public
router.get('/:id', getProductById);

// POST /api/products  — Admin only (multipart/form-data with images)
router.post('/', protect, admin, createProduct);

// PUT /api/products/:id  — Admin only
router.put('/:id', protect, admin, updateProduct);

// DELETE /api/products/:id  — Admin only (soft delete)
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
