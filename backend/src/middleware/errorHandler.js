import logger from '../config/logger.js';
import { ApiResponse, AppError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Operational errors: send message to client
  if (err.isOperational) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // Programming/unknown errors: don't leak details
  return ApiResponse.error(
    res, 
    process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    err.statusCode
  );
};

export const notFound = (req, res, next) => {
  const error = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(error);
};