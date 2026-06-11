const mongoose = require('mongoose');

// ─── Embedded snapshot of ordered product ────────────────────────────────────
// We snapshot product details (name, price) so historical orders remain
// accurate even if the product is later updated or deleted.
const orderProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    size: {
      type: String,
    },
    color: {
      type: String,
    },
    price: {
      type: Number, // Price at the time of order placement
      required: true,
    },
  },
  { _id: false }
);

// ─── Main Order Schema ────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    products: {
      type: [orderProductSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Order must contain at least one product',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    // ─── Payment ─────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: 'Invalid payment status',
      },
      default: 'Pending',
    },
    paymentProof: {
      type: String, // Path to uploaded screenshot
      default: null,
    },
    // ─── Order Progress ───────────────────────────────────────────────────────
    orderStatus: {
      type: String,
      enum: {
        values: [
          'Pending Payment',
          'Payment Approved',
          'Processing',
          'Shipped',
          'Delivered',
          'Cancelled',
        ],
        message: 'Invalid order status',
      },
      default: 'Pending Payment',
    },
    // ─── Admin Notes ──────────────────────────────────────────────────────────
    adminRemarks: {
      type: String,
      trim: true,
      default: null,
    },
    // ─── Shipping Address (optional, for future use) ─────────────────────────
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Order', orderSchema);
