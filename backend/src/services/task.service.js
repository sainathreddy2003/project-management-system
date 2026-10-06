import { v4 as uuidv4 } from 'uuid';
import { query, execute } from '../config/db.js';
import { recordAudit } from './audit.service.js';

export async function listTasks(userId, { page, pageSize, projectId, search, status, priority, sortBy, sortOrder }) {
  const offset = (page - 1) * pageSize;
  const whereClauses = ['p.userId = ?'];
  const params = [userId];

  if (projectId) {
    whereClauses.push('t.projectId = ?');
    params.push(projectId);
  }

  if (status) {
    whereClauses.push('t.status = ?');
    params.push(status);
  }

  if (priority) {
    whereClauses.push('t.priority = ?');
    params.push(priority);
  }

  if (search) {
    whereClauses.push('(t.name LIKE ? OR t.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereSql = whereClauses.join(' AND ');

  // Count total
  const countSql = `
    SELECT COUNT(*) AS total
    FROM tasks t
    JOIN projects p ON t.projectId = p.id
    WHERE ${whereSql}
  `;
  const countResult = await query(countSql, params);
  const total = Number(countResult[0]?.total || 0);

  const allowedSortCols = {
    name: 't.name',
    status: 't.status',
    priority: 'CASE t.priority WHEN "HIGH" THEN 1 WHEN "MEDIUM" THEN 2 ELSE 3 END',
    dueDate: 'COALESCE(t.dueDate, "9999-12-31")',
    createdAt: 't.createdAt',
  };
  const sortCol = allowedSortCols[sortBy] || 't.createdAt';
  const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const selectSql = `
    SELECT 
      t.id,
      t.projectId,
      p.name AS projectName,
      t.name,
      t.description,
      t.priority,
      t.status,
      DATE_FORMAT(t.dueDate, '%Y-%m-%d') AS dueDate,
      t.createdAt,
      t.updatedAt
    FROM tasks t
    JOIN projects p ON t.projectId = p.id
    WHERE ${whereSql}
    ORDER BY ${sortCol} ${orderDir}
    LIMIT ? OFFSET ?
  `;

  const rows = await query(selectSql, [...params, pageSize, offset]);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
}

export async function getTaskById(userId, taskId) {
  // Join with project to enforce ownership
  const rows = await query(
    `SELECT 
      t.id,
      t.projectId,
      p.name AS projectName,
      t.name,
      t.description,
      t.priority,
      t.status,
      DATE_FORMAT(t.dueDate, '%Y-%m-%d') AS dueDate,
      t.createdAt,
      t.updatedAt
     FROM tasks t
     JOIN projects p ON t.projectId = p.id
     WHERE t.id = ? AND p.userId = ?`,
    [taskId, userId]
  );

  if (rows.length === 0) {
    const error = new Error('Task not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
}

export async function createTask(userId, { projectId, name, description, priority, status, dueDate }) {
  // Verify target project belongs to the authenticated user
  const projects = await query('SELECT id FROM projects WHERE id = ? AND userId = ?', [projectId, userId]);
  if (projects.length === 0) {
    const error = new Error('Project not found or you do not have permission to add tasks to it.');
    error.statusCode = 404;
    throw error;
  }

  const id = uuidv4();
  await execute(
    `INSERT INTO tasks (id, projectId, name, description, priority, status, dueDate)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, projectId, name, description, priority, status, dueDate || null]
  );

  await recordAudit(userId, 'CREATE_TASK', 'Task', id);
  return getTaskById(userId, id);
}

export async function updateTask(userId, taskId, updates) {
  // Verify task belongs to a project owned by user
  const existing = await query(
    `SELECT t.id, t.projectId 
     FROM tasks t 
     JOIN projects p ON t.projectId = p.id 
     WHERE t.id = ? AND p.userId = ?`,
    [taskId, userId]
  );

  if (existing.length === 0) {
    const error = new Error('Task not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  // If moving task to a different project, verify ownership of destination project
  if (updates.projectId && updates.projectId !== existing[0].projectId) {
    const targetProjects = await query('SELECT id FROM projects WHERE id = ? AND userId = ?', [updates.projectId, userId]);
    if (targetProjects.length === 0) {
      const error = new Error('Target project not found or access denied.');
      error.statusCode = 404;
      throw error;
    }
  }

  const fields = [];
  const params = [];

  for (const [key, val] of Object.entries(updates)) {
    if (['projectId', 'name', 'description', 'priority', 'status', 'dueDate'].includes(key)) {
      fields.push(`${key} = ?`);
      params.push(val);
    }
  }

  if (fields.length > 0) {
    params.push(taskId);
    await execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  await recordAudit(userId, 'UPDATE_TASK', 'Task', taskId);
  return getTaskById(userId, taskId);
}

export async function deleteTask(userId, taskId) {
  // Verify ownership before deleting
  const existing = await query(
    `SELECT t.id 
     FROM tasks t 
     JOIN projects p ON t.projectId = p.id 
     WHERE t.id = ? AND p.userId = ?`,
    [taskId, userId]
  );

  if (existing.length === 0) {
    const error = new Error('Task not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  await execute('DELETE FROM tasks WHERE id = ?', [taskId]);
  await recordAudit(userId, 'DELETE_TASK', 'Task', taskId);

  return { id: taskId, deleted: true };
}
