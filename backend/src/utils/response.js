export function sendSuccess(res, data = null, message = null, statusCode = 200, pagination = null) {
  const body = {
    success: true,
  };
  if (message) body.message = message;
  if (data !== null && data !== undefined) body.data = data;
  if (pagination) body.pagination = pagination;

  return res.status(statusCode).json(body);
}

export function sendError(res, error = 'An error occurred', statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error,
  });
}
