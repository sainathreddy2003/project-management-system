import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  // Handle MySQL duplicate key error (ER_DUP_ENTRY / 1062)
  if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
    return sendError(res, 'A record with this information already exists.', 409);
  }

  const statusCode = err && err.statusCode ? err.statusCode : 500;
  const message = err && err.message ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error('Unhandled server error', {
      path: req.originalUrl,
      method: req.method,
      statusCode,
      error: message,
      stack: err && err.stack ? err.stack : undefined,
    });
  } else {
    logger.warn('Client request error', {
      path: req.originalUrl,
      method: req.method,
      statusCode,
      error: message,
    });
  }

  return sendError(
    res,
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected server error occurred. Please try again later.'
      : message,
    statusCode
  );
}
