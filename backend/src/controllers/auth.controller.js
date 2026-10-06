import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const validation = validateRegister(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.error, 400);
    }

    const result = await authService.registerUser(validation.data);
    return sendSuccess(res, result, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.error, 400);
    }

    const result = await authService.loginUser(validation.data);
    return sendSuccess(res, result, 'Login successful.', 200);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return sendError(res, 'Refresh token is required.', 400);
    }

    const tokens = await authService.refreshAccessToken(refreshToken);
    return sendSuccess(res, tokens, 'Token refreshed successfully.', 200);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    const userId = req.user?.id;
    await authService.logoutUser(refreshToken, userId);
    return sendSuccess(res, null, 'Logged out successfully.', 200);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, user, null, 200);
  } catch (err) {
    next(err);
  }
}
