import { v4 as uuidv4 } from 'uuid';
import { execute, query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * AUDIT LOG MODEL
 * Encapsulates audit trail recording and queries.
 */

export async function recordAudit(userId, action, entityType, entityId) {
  try {
    const id = uuidv4();
    await execute(
      'INSERT INTO audit_logs (id, userId, action, entityType, entityId) VALUES (?, ?, ?, ?, ?)',
      [id, userId, action, entityType, entityId]
    );
  } catch (err) {
    logger.warn('Failed to record audit log', { error: err.message, userId, action });
  }
}

export async function getAuditLogsForUser(userId, limit = 50) {
  return query(
    `SELECT id, action, entityType, entityId, createdAt
     FROM audit_logs
     WHERE userId = ?
     ORDER BY createdAt DESC
     LIMIT ?`,
    [userId, limit]
  );
}
