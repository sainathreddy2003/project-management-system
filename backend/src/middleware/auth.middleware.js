import { verifyAccessToken } from '../utils/jwt.js';
import { query } from '../config/db.js';
import { sendError } from '../utils/response.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Please provide a valid Bearer token.', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return sendError(res, 'Authentication token missing.', 401);
  }

  try {
    const payload = verifyAccessToken(token);
    const users = await query('SELECT id, fullName, email FROM users WHERE id = ?', [payload.userId]);

    if (!users || users.length === 0) {
      return sendError(res, 'User account associated with this session no longer exists.', 401);
    }

    req.user = users[0];
    next();
  } catch (err) {
    // Return exact session expiration message requested by assessment
    return sendError(res, 'Your session expired. Please sign in again.', 401);
  }
}
