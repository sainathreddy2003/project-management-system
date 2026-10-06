import { v4 as uuidv4 } from 'uuid';
import { execute } from '../config/db.js';
import { logger } from '../utils/logger.js';

export async function recordAudit(userId, action, entityType, entityId) {
  try {
    const id = uuidv4();
    await execute(
      'INSERT INTO audit_logs (id, userId, action, entityType, entityId) VALUES (?, ?, ?, ?, ?)',
      [id, userId, action, entityType, entityId]
    );
  } catch (err) {
    logger.warn('Failed to record audit log', {
      userId,
      action,
      entityType,
      entityId,
      error: err.message,
    });
  }
}
