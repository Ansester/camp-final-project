const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 */
const generateToken = (userId, role) => {
  const payload = {
    userId,
    role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    return typeof decoded === 'object' && /^[a-f\d]{24}$/i.test(decoded.userId) ? decoded : null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
