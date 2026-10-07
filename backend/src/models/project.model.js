import { v4 as uuidv4 } from 'uuid';
import { query, execute } from '../config/db.js';
import { recordAudit } from './audit.model.js';

/**
 * PROJECT MODEL
 * Encapsulates MySQL relational data operations for projects with tenancy isolation.
 */

export async function listProjects(userId, { page, pageSize, search, status, sortBy, sortOrder }) {
  const offset = (page - 1) * pageSize;
  const whereClauses = ['p.userId = ?'];
  const params = [userId];

  if (status) {
    whereClauses.push('p.status = ?');
    params.push(status);
  }

  if (search) {
    whereClauses.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereSql = whereClauses.join(' AND ');

  // Total count
  const countSql = `SELECT COUNT(*) AS total FROM projects p WHERE ${whereSql}`;
  const countResult = await query(countSql, params);
  const total = Number(countResult[0]?.total || 0);

  // Valid sort columns
  const allowedSortCols = {
    name: 'p.name',
    status: 'p.status',
    startDate: 'p.startDate',
    endDate: 'p.endDate',
    createdAt: 'p.createdAt',
  };
  const sortCol = allowedSortCols[sortBy] || 'p.createdAt';
  const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const selectSql = `
    SELECT 
      p.id,
      p.userId,
      p.name,
      p.description,
      p.status,
      DATE_FORMAT(p.startDate, '%Y-%m-%d') AS startDate,
      DATE_FORMAT(p.endDate, '%Y-%m-%d') AS endDate,
      p.createdAt,
      p.updatedAt,
      COUNT(t.id) AS totalTasks,
      COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completedTasks
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.projectId
    WHERE ${whereSql}
    GROUP BY p.id
    ORDER BY ${sortCol} ${orderDir}
    LIMIT ? OFFSET ?
  `;

  const rows = await query(selectSql, [...params, pageSize, offset]);

  const data = rows.map((row) => {
    const totalTasks = Number(row.totalTasks || 0);
    const completedTasks = Number(row.completedTasks || 0);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description,
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      totalTasks,
      completedTasks,
      progress,
    };
  });

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
}

export async function getProjectById(userId, projectId) {
  // Strict tenancy ownership check
  const projectRows = await query(
    `SELECT 
      id, userId, name, description, status,
      DATE_FORMAT(startDate, '%Y-%m-%d') AS startDate,
      DATE_FORMAT(endDate, '%Y-%m-%d') AS endDate,
      createdAt, updatedAt
     FROM projects
     WHERE id = ? AND userId = ?`,
    [projectId, userId]
  );

  if (projectRows.length === 0) {
    const error = new Error('Project not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  const project = projectRows[0];

  // Fetch child tasks
  const taskRows = await query(
    `SELECT 
      id, projectId, name, description, priority, status,
      DATE_FORMAT(dueDate, '%Y-%m-%d') AS dueDate,
      createdAt, updatedAt
     FROM tasks
     WHERE projectId = ?
     ORDER BY 
       CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
       COALESCE(dueDate, '9999-12-31') ASC,
       createdAt DESC`,
    [projectId]
  );

  const totalTasks = taskRows.length;
  const completedTasks = taskRows.filter((t) => t.status === 'COMPLETED').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    ...project,
    totalTasks,
    completedTasks,
    progress,
    tasks: taskRows,
  };
}

export async function createProject(userId, { name, description, status, startDate, endDate }) {
  const id = uuidv4();
  await execute(
    `INSERT INTO projects (id, userId, name, description, status, startDate, endDate)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, name, description, status, startDate || null, endDate || null]
  );

  await recordAudit(userId, 'CREATE_PROJECT', 'Project', id);
  return getProjectById(userId, id);
}

export async function updateProject(userId, projectId, updates) {
  // Check ownership first
  const existing = await query('SELECT id FROM projects WHERE id = ? AND userId = ?', [projectId, userId]);
  if (existing.length === 0) {
    const error = new Error('Project not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  const fields = [];
  const params = [];

  for (const [key, val] of Object.entries(updates)) {
    if (['name', 'description', 'status', 'startDate', 'endDate'].includes(key)) {
      fields.push(`${key} = ?`);
      params.push(val);
    }
  }

  if (fields.length > 0) {
    params.push(projectId, userId);
    await execute(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
      params
    );
  }

  await recordAudit(userId, 'UPDATE_PROJECT', 'Project', projectId);
  return getProjectById(userId, projectId);
}

export async function deleteProject(userId, projectId) {
  // Check ownership
  const existing = await query('SELECT id FROM projects WHERE id = ? AND userId = ?', [projectId, userId]);
  if (existing.length === 0) {
    const error = new Error('Project not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  await execute('DELETE FROM projects WHERE id = ? AND userId = ?', [projectId, userId]);
  await recordAudit(userId, 'DELETE_PROJECT', 'Project', projectId);

  return { id: projectId, deleted: true };
}
