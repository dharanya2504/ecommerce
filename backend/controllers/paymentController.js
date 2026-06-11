const QRCode = require('qrcode');
const Order = require('../models/Order');
const { handlePaymentProofUpload } = require('../middleware/uploadMiddleware');

// ─── Generate UPI QR Code ─────────────────────────────────────────────────────
// GET /api/payment/qr  [Public]
// Returns a Base64-encoded PNG QR code image for UPI payment.
const getPaymentQR = async (req, res, next) => {
  try {
    const upiId = process.env.UPI_ID || 'yourupi@okaxis';
    const upiName = process.env.UPI_NAME || 'SimpleEcommerce';

    // Build UPI deep link
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR`;

    // Generate QR code as Base64 Data URL
    const qrCodeImage = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 300,
    });

    res.status(200).json({
      success: true,
      qrCodeImage,          // Base64 data URL (paste into <img src="...">)
      upiId,
      upiName,
      upiString,            // Raw UPI deep link for reference
      instructions: [
        '1. Open any UPI payment app (GPay, PhonePe, Paytm, etc.)',
        '2. Scan this QR code or use UPI ID: ' + upiId,
        '3. Enter the exact order amount',
        '4. Complete the payment',
        '5. Take a screenshot of your payment confirmation',
        '6. Upload the screenshot via POST /api/payment/upload-proof',
      ],
    });
  } catch (error) {
    next(error);
  }
};

// ─── Upload Payment Proof ─────────────────────────────────────────────────────
// POST /api/payment/upload-proof  [Protected]
// Accepts a payment screenshot upload and stores the path in the order.
const uploadPaymentProof = async (req, res, next) => {
  try {
    // Handle file upload
    await handlePaymentProofUpload(req, res);

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment proof image is required. Please upload a screenshot.',
      });
    }

    // Find the order and verify ownership
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only upload proof for your own orders.',
      });
    }

    // Validate order is in correct state for proof upload
    if (order.paymentStatus === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been approved for this order.',
      });
    }

    if (!['Pending Payment', 'Pending'].includes(order.orderStatus)) {
      if (order.orderStatus !== 'Pending Payment') {
        // Allow re-upload only if rejected
        if (order.paymentStatus !== 'Rejected') {
          return res.status(400).json({
            success: false,
            message: `Cannot upload payment proof for an order with status: ${order.orderStatus}`,
          });
        }
      }
    }

    // Store the image path and reset payment status to Pending if it was Rejected
    const imagePath = `/uploads/${req.file.filename}`;
    order.paymentProof = imagePath;
    order.paymentStatus = 'Pending'; // Reset to Pending for admin review
    order.adminRemarks = null;       // Clear any previous rejection remarks

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment proof uploaded successfully. Awaiting admin approval.',
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentProof: imagePath,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentQR,
  uploadPaymentProof,
};
