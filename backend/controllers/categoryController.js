const { body, param } = require('express-validator');
const Category = require('../models/Category');
const { validateRequest } = require('../middleware/validateMiddleware');

// ─── Validation Rules ─────────────────────────────────────────────────────────
const categoryValidation = [
  body('categoryName')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  validateRequest,
];

// ─── Create Category ──────────────────────────────────────────────────────────
// POST /api/categories  [Admin Only]
const createCategory = async (req, res, next) => {
  try {
    const { categoryName, description } = req.body;

    const exists = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') },
    });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: `Category "${categoryName}" already exists.`,
      });
    }

    const category = await Category.create({ categoryName, description });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Categories ───────────────────────────────────────────────────────
// GET /api/categories  [Public]
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ categoryName: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Category ──────────────────────────────────────────────────────
// GET /api/categories/:id  [Public]
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// ─── Update Category ──────────────────────────────────────────────────────────
// PUT /api/categories/:id  [Admin Only]
const updateCategory = async (req, res, next) => {
  try {
    const { categoryName, description } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check for duplicate name (excluding the current category)
    if (categoryName && categoryName !== category.categoryName) {
      const duplicate = await Category.findOne({
        categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') },
        _id: { $ne: req.params.id },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Category "${categoryName}" already exists.`,
        });
      }
    }

    if (categoryName) category.categoryName = categoryName;
    if (description !== undefined) category.description = description;

    const updated = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Category ──────────────────────────────────────────────────────────
// DELETE /api/categories/:id  [Admin Only]
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  categoryValidation,
};
