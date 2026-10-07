/**
 * RESPONSE VIEW (API Presentation Layer)
 * Standardizes API responses across all controllers.
 * 
 * Formats:
 * - Success responses: { success: true, message, data, pagination }
 * - Error responses: { success: false, error }
 */

export function renderSuccess(res, data = null, message = null, statusCode = 200, pagination = null) {
  const responsePayload = {
    success: true,
  };

  if (message) {
    responsePayload.message = message;
  }

  if (data !== null && data !== undefined) {
    responsePayload.data = data;
  }

  if (pagination) {
    responsePayload.pagination = pagination;
  }

  return res.status(statusCode).json(responsePayload);
}

export function renderError(res, errorMessage = 'Internal Server Error', statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    error: errorMessage,
  });
}
