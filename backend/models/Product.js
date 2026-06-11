const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sizes: {
      type: [String],
      default: [],
      // e.g. ["XS", "S", "M", "L", "XL", "XXL"]
    },
    colors: {
      type: [String],
      default: [],
      // e.g. ["Red", "Blue", "Black", "White"]
    },
    images: {
      type: [String], // Array of file paths or URLs
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching and filtering
productSchema.index({ productName: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);
