const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token for a given user.
 *
 * @param {string} id - The MongoDB User _id
 * @param {string} role - The user's role ('user' or 'admin')
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;
