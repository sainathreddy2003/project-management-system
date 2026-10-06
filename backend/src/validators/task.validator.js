const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const VALID_SORT_FIELDS = ['name', 'status', 'priority', 'dueDate', 'createdAt'];

export function validateCreateTask(body) {
  const errors = [];
  const { projectId, name, description, priority, status, dueDate } = body || {};

  if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
    errors.push('Project ID is required.');
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Task name is required.');
  } else if (name.trim().length > 255) {
    errors.push('Task name must not exceed 255 characters.');
  }

  const taskPriority = priority || 'MEDIUM';
  if (!VALID_PRIORITIES.includes(taskPriority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  }

  const taskStatus = status || 'PENDING';
  if (!VALID_STATUSES.includes(taskStatus)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  let parsedDueDate = null;
  if (dueDate) {
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) {
      errors.push('Due date must be a valid date.');
    } else {
      parsedDueDate = dueDate.split('T')[0];
    }
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(' '),
    data: errors.length === 0 ? {
      projectId: projectId.trim(),
      name: name.trim(),
      description: description ? description.trim() : null,
      priority: taskPriority,
      status: taskStatus,
      dueDate: parsedDueDate,
    } : null,
  };
}

export function validateUpdateTask(body) {
  const errors = [];
  const { projectId, name, description, priority, status, dueDate } = body || {};

  const updates = {};

  if (projectId !== undefined) {
    if (typeof projectId !== 'string' || projectId.trim().length === 0) {
      errors.push('Project ID cannot be empty.');
    } else {
      updates.projectId = projectId.trim();
    }
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Task name cannot be empty.');
    } else if (name.trim().length > 255) {
      errors.push('Task name must not exceed 255 characters.');
    } else {
      updates.name = name.trim();
    }
  }

  if (description !== undefined) {
    updates.description = description ? description.trim() : null;
  }

  if (priority !== undefined) {
    if (!VALID_PRIORITIES.includes(priority)) {
      errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
    } else {
      updates.priority = priority;
    }
  }

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
    } else {
      updates.status = status;
    }
  }

  if (dueDate !== undefined) {
    if (dueDate === null || dueDate === '') {
      updates.dueDate = null;
    } else {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) {
        errors.push('Due date must be a valid date.');
      } else {
        updates.dueDate = dueDate.split('T')[0];
      }
    }
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(' '),
    data: errors.length === 0 ? updates : null,
  };
}

export function parseTaskQuery(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '20', 10) || 20));
  const projectId = query.projectId ? String(query.projectId).trim() : null;
  const search = query.search ? String(query.search).trim() : null;
  const status = VALID_STATUSES.includes(query.status) ? query.status : null;
  const priority = VALID_PRIORITIES.includes(query.priority) ? query.priority : null;
  const sortBy = VALID_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder && query.sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  return {
    page,
    pageSize,
    projectId,
    search,
    status,
    priority,
    sortBy,
    sortOrder,
  };
}
