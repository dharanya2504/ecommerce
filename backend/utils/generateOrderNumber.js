const crypto = require('crypto');

/**
 * Generates a unique order number.
 *
 * Format: ORD-YYYYMMDD-XXXXXXXX (date + 8 random hex chars)
 * Example: ORD-20240611-A3F9E12B
 *
 * @returns {string} Unique order number string
 */
const generateOrderNumber = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
  return `ORD-${datePart}-${randomPart}`;
};

module.exports = generateOrderNumber;
