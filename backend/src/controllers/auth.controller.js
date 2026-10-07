import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import * as UserModel from '../models/user.model.js';
import { renderSuccess, renderError } from '../views/response.view.js';

/**
 * AUTH / USER CONTROLLER
 * Handles registration, login, token rotation, profile queries, and interacts with UserModel.
 */

export async function register(req, res, next) {
  try {
    const validation = validateRegister(req.body);
    if (!validation.isValid) {
      return renderError(res, validation.error, 400);
    }

    const result = await UserModel.registerUser(validation.data);
    return renderSuccess(res, result, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return renderError(res, validation.error, 400);
    }

    const result = await UserModel.loginUser(validation.data);
    return renderSuccess(res, result, 'Login successful.', 200);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return renderError(res, 'Refresh token is required.', 400);
    }

    const tokens = await UserModel.refreshAccessToken(refreshToken);
    return renderSuccess(res, tokens, 'Token refreshed successfully.', 200);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    const userId = req.user?.id;
    await UserModel.logoutUser(refreshToken, userId);
    return renderSuccess(res, null, 'Logged out successfully.', 200);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await UserModel.getCurrentUser(req.user.id);
    return renderSuccess(res, user, null, 200);
  } catch (err) {
    next(err);
  }
}
