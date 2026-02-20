const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * protect - Verifies JWT and attaches the authenticated user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized. No token provided.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Not authorized. Token is invalid or expired.', 401));
  }
});

/**
 * adminOnly - Allows access only to users with the admin role
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Access denied. Admins only.', 403));
  }
  next();
};

module.exports = { protect, adminOnly };
