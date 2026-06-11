const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  categoryValidation,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/categories  — Public
router.get('/', getCategories);

// GET /api/categories/:id  — Public
router.get('/:id', getCategoryById);

// POST /api/categories  — Admin only
router.post('/', protect, admin, categoryValidation, createCategory);

// PUT /api/categories/:id  — Admin only
router.put('/:id', protect, admin, updateCategory);

// DELETE /api/categories/:id  — Admin only
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
