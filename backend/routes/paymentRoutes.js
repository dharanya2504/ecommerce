const express = require('express');
const router = express.Router();
const {
  getPaymentQR,
  uploadPaymentProof,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/payment/qr  — Public (customers scan QR to pay)
router.get('/qr', getPaymentQR);

// POST /api/payment/upload-proof  — Protected (upload screenshot after payment)
router.post('/upload-proof', protect, uploadPaymentProof);

module.exports = router;
