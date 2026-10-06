const VALID_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
const VALID_SORT_FIELDS = ['name', 'status', 'startDate', 'endDate', 'createdAt'];

export function validateCreateProject(body) {
  const errors = [];
  const { name, description, status, startDate, endDate } = body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Project name is required.');
  } else if (name.trim().length > 255) {
    errors.push('Project name must not exceed 255 characters.');
  }

  const projectStatus = status || 'NOT_STARTED';
  if (!VALID_STATUSES.includes(projectStatus)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  let parsedStartDate = null;
  if (startDate) {
    const d = new Date(startDate);
    if (isNaN(d.getTime())) {
      errors.push('Start date must be a valid date.');
    } else {
      parsedStartDate = startDate.split('T')[0];
    }
  }

  let parsedEndDate = null;
  if (endDate) {
    const d = new Date(endDate);
    if (isNaN(d.getTime())) {
      errors.push('End date must be a valid date.');
    } else {
      parsedEndDate = endDate.split('T')[0];
    }
  }

  if (parsedStartDate && parsedEndDate && new Date(parsedEndDate) < new Date(parsedStartDate)) {
    errors.push('End date must be after or equal to start date.');
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(' '),
    data: errors.length === 0 ? {
      name: name.trim(),
      description: description ? description.trim() : null,
      status: projectStatus,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    } : null,
  };
}

export function validateUpdateProject(body) {
  const errors = [];
  const { name, description, status, startDate, endDate } = body || {};

  const updates = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Project name cannot be empty.');
    } else if (name.trim().length > 255) {
      errors.push('Project name must not exceed 255 characters.');
    } else {
      updates.name = name.trim();
    }
  }

  if (description !== undefined) {
    updates.description = description ? description.trim() : null;
  }

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
    } else {
      updates.status = status;
    }
  }

  if (startDate !== undefined) {
    if (startDate === null || startDate === '') {
      updates.startDate = null;
    } else {
      const d = new Date(startDate);
      if (isNaN(d.getTime())) {
        errors.push('Start date must be a valid date.');
      } else {
        updates.startDate = startDate.split('T')[0];
      }
    }
  }

  if (endDate !== undefined) {
    if (endDate === null || endDate === '') {
      updates.endDate = null;
    } else {
      const d = new Date(endDate);
      if (isNaN(d.getTime())) {
        errors.push('End date must be a valid date.');
      } else {
        updates.endDate = endDate.split('T')[0];
      }
    }
  }

  if (updates.startDate && updates.endDate && new Date(updates.endDate) < new Date(updates.startDate)) {
    errors.push('End date must be after or equal to start date.');
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(' '),
    data: errors.length === 0 ? updates : null,
  };
}

export function parseProjectQuery(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '10', 10) || 10));
  const search = query.search ? String(query.search).trim() : null;
  const status = VALID_STATUSES.includes(query.status) ? query.status : null;
  const sortBy = VALID_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder && query.sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  return {
    page,
    pageSize,
    search,
    status,
    sortBy,
    sortOrder,
  };
}
