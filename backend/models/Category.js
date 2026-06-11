const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Remove __v from responses
categorySchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Category', categorySchema);
