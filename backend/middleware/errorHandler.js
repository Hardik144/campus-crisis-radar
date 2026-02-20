const AppError = require('../utils/AppError');

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate value for field: ${field}. Please use a different value.`;
  return new AppError(message, 409);
};

/**
 * Handle Mongoose validation error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Token has expired. Please log in again.', 401);

/**
 * Development error response - full stack trace
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

/**
 * Production error response - only operational errors shown to client
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('💥 UNHANDLED ERROR:', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

/**
 * Central error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
