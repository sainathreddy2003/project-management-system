import { validateCreateTask, validateUpdateTask, parseTaskQuery } from '../validators/task.validator.js';
import * as TaskModel from '../models/task.model.js';
import { renderSuccess, renderError } from '../views/response.view.js';

/**
 * TASK CONTROLLER
 * Handles HTTP requests for tasks, validates payloads, and interacts with TaskModel.
 */

export async function listTasks(req, res, next) {
  try {
    const queryParams = parseTaskQuery(req.query);
    const result = await TaskModel.listTasks(req.user.id, queryParams);
    return renderSuccess(res, result.data, null, 200, result.pagination);
  } catch (err) {
    next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    const { id } = req.params;
    const task = await TaskModel.getTaskById(req.user.id, id);
    return renderSuccess(res, task, null, 200);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const validation = validateCreateTask(req.body);
    if (!validation.isValid) {
      return renderError(res, validation.error, 400);
    }

    const task = await TaskModel.createTask(req.user.id, validation.data);
    return renderSuccess(res, task, 'Task created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const validation = validateUpdateTask(req.body);
    if (!validation.isValid) {
      return renderError(res, validation.error, 400);
    }

    const task = await TaskModel.updateTask(req.user.id, id, validation.data);
    return renderSuccess(res, task, 'Task updated successfully.', 200);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const result = await TaskModel.deleteTask(req.user.id, id);
    return renderSuccess(res, result, 'Task deleted successfully.', 200);
  } catch (err) {
    next(err);
  }
}
