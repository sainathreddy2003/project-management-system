import { v4 as uuidv4 } from 'uuid';
import { query, execute } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, generateRefreshToken, hashToken } from '../utils/jwt.js';
import { recordAudit } from './audit.model.js';
import { config } from '../config/index.js';

/**
 * USER MODEL
 * Encapsulates all database operations for users and authentication sessions.
 */

export async function registerUser({ fullName, email, password }) {
  const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const userId = uuidv4();
  const passwordHash = await hashPassword(password);

  await execute(
    'INSERT INTO users (id, fullName, email, passwordHash) VALUES (?, ?, ?, ?)',
    [userId, fullName, email, passwordHash]
  );

  const users = await query('SELECT id, fullName, email, createdAt FROM users WHERE id = ?', [userId]);
  const user = users[0];

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

  const sessionId = uuidv4();
  await execute(
    'INSERT INTO refresh_sessions (id, userId, tokenHash, expiresAt) VALUES (?, ?, ?, ?)',
    [sessionId, user.id, tokenHash, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
  );

  await recordAudit(user.id, 'REGISTER', 'User', user.id);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken: rawRefreshToken,
  };
}

export async function loginUser({ email, password }) {
  const users = await query('SELECT id, fullName, email, passwordHash, createdAt FROM users WHERE email = ?', [email]);
  if (users.length === 0) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

  const sessionId = uuidv4();
  await execute(
    'INSERT INTO refresh_sessions (id, userId, tokenHash, expiresAt) VALUES (?, ?, ?, ?)',
    [sessionId, user.id, tokenHash, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
  );

  await recordAudit(user.id, 'LOGIN', 'User', user.id);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken: rawRefreshToken,
  };
}

export async function refreshAccessToken(rawRefreshToken) {
  if (!rawRefreshToken) {
    const error = new Error('Refresh token is required.');
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashToken(rawRefreshToken);
  const sessions = await query(
    `SELECT s.id, s.userId, s.expiresAt, s.revokedAt, u.email, u.fullName
     FROM refresh_sessions s
     JOIN users u ON s.userId = u.id
     WHERE s.tokenHash = ?`,
    [tokenHash]
  );

  if (sessions.length === 0) {
    const error = new Error('Your session expired. Please sign in again.');
    error.statusCode = 401;
    throw error;
  }

  const session = sessions[0];
  const isExpired = new Date(session.expiresAt) < new Date();
  if (session.revokedAt || isExpired) {
    const error = new Error('Your session expired. Please sign in again.');
    error.statusCode = 401;
    throw error;
  }

  // Revoke previous session
  await execute('UPDATE refresh_sessions SET revokedAt = NOW() WHERE id = ?', [session.id]);

  // Issue new session
  const newRawRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

  const newSessionId = uuidv4();
  await execute(
    'INSERT INTO refresh_sessions (id, userId, tokenHash, expiresAt) VALUES (?, ?, ?, ?)',
    [newSessionId, session.userId, newTokenHash, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
  );

  const accessToken = signAccessToken({ userId: session.userId, email: session.email });

  return {
    accessToken,
    refreshToken: newRawRefreshToken,
  };
}

export async function logoutUser(rawRefreshToken, userId) {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await execute('UPDATE refresh_sessions SET revokedAt = NOW() WHERE tokenHash = ? AND revokedAt IS NULL', [tokenHash]);
  }

  if (userId) {
    await recordAudit(userId, 'LOGOUT', 'User', userId);
  }
}

export async function getCurrentUser(userId) {
  const users = await query('SELECT id, fullName, email, createdAt, updatedAt FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }
  return users[0];
}
