const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Ensure uploads/ directory exists ────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Storage Configuration ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Format: fieldname-timestamp-randomhex.ext
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ─── File Filter: Accept only images ─────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.'),
      false
    );
  }
};

// ─── Multer Instances ─────────────────────────────────────────────────────────

// For payment proof uploads (single file, field name: "paymentProof")
const uploadPaymentProof = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 1,
  },
}).single('paymentProof');

// For product images uploads (multiple files, field name: "images", max 5)
const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 5,
  },
}).array('images', 5);

// ─── Promisified wrappers to use multer in async controllers ─────────────────
const handlePaymentProofUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadPaymentProof(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const handleProductImagesUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadProductImages(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

module.exports = {
  handlePaymentProofUpload,
  handleProductImagesUpload,
};
