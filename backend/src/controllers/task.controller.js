import { validateCreateTask, validateUpdateTask, parseTaskQuery } from '../validators/task.validator.js';
import * as taskService from '../services/task.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function listTasks(req, res, next) {
  try {
    const queryParams = parseTaskQuery(req.query);
    const result = await taskService.listTasks(req.user.id, queryParams);
    return sendSuccess(res, result.data, null, 200, result.pagination);
  } catch (err) {
    next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(req.user.id, id);
    return sendSuccess(res, task, null, 200);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const validation = validateCreateTask(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.error, 400);
    }

    const task = await taskService.createTask(req.user.id, validation.data);
    return sendSuccess(res, task, 'Task created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const validation = validateUpdateTask(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.error, 400);
    }

    const task = await taskService.updateTask(req.user.id, id, validation.data);
    return sendSuccess(res, task, 'Task updated successfully.', 200);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const result = await taskService.deleteTask(req.user.id, id);
    return sendSuccess(res, result, 'Task deleted successfully.', 200);
  } catch (err) {
    next(err);
  }
}
