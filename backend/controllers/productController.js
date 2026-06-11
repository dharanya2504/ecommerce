const { body } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { handleProductImagesUpload } = require('../middleware/uploadMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

// ─── Validation Rules ─────────────────────────────────────────────────────────
const productValidation = [
  body('productName')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  validateRequest,
];

// ─── Create Product ───────────────────────────────────────────────────────────
// POST /api/products  [Admin Only]
const createProduct = async (req, res, next) => {
  try {
    // Handle file upload via multer
    await handleProductImagesUpload(req, res);

    const {
      productName,
      description,
      category,
      price,
      stock,
      sizes,
      colors,
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Build image paths from uploaded files
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    // Parse sizes and colors if sent as JSON strings (from form-data)
    const parsedSizes = sizes
      ? typeof sizes === 'string'
        ? JSON.parse(sizes)
        : sizes
      : [];
    const parsedColors = colors
      ? typeof colors === 'string'
        ? JSON.parse(colors)
        : colors
      : [];

    const product = await Product.create({
      productName,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      sizes: parsedSizes,
      colors: parsedColors,
      images,
    });

    await product.populate('category', 'categoryName');

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Products ─────────────────────────────────────────────────────────
// GET /api/products  [Public]
// Query params: category, search, minPrice, maxPrice, inStock, page, limit
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };

    // Category filter
    if (category) filter.category = category;

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // In-stock filter
    if (inStock === 'true') filter.stock = { $gt: 0 };

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

// ─── Get Single Product ───────────────────────────────────────────────────────
// GET /api/products/:id  [Public]
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'categoryName description'
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (!product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: 'Product is no longer available.' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// ─── Update Product ───────────────────────────────────────────────────────────
// PUT /api/products/:id  [Admin Only]
const updateProduct = async (req, res, next) => {
  try {
    // Handle optional file upload
    await handleProductImagesUpload(req, res);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      productName,
      description,
      category,
      price,
      stock,
      sizes,
      colors,
      isActive,
      replaceImages, // If "true", replace all images; otherwise append
    } = req.body;

    // Verify category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      product.category = category;
    }

    if (productName) product.productName = productName;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

    if (sizes) {
      product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    }
    if (colors) {
      product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
    }

    // Handle images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      if (replaceImages === 'true') {
        product.images = newImages;
      } else {
        product.images = [...product.images, ...newImages];
      }
    }

    const updated = await product.save();
    await updated.populate('category', 'categoryName');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Product ───────────────────────────────────────────────────────────
// DELETE /api/products/:id  [Admin Only]
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Soft delete: set isActive to false
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  productValidation,
};
