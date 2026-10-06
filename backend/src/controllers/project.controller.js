import { validateCreateProject, validateUpdateProject, parseProjectQuery } from '../validators/project.validator.js';
import * as projectService from '../services/project.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function listProjects(req, res, next) {
  try {
    const queryParams = parseProjectQuery(req.query);
    const result = await projectService.listProjects(req.user.id, queryParams);
    return sendSuccess(res, result.data, null, 200, result.pagination);
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(req.user.id, id);
    return sendSuccess(res, project, null, 200);
  } catch (err) {
    next(err);
  }
}

export async function createProject(req, res, next) {
  try {
    const validation = validateCreateProject(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.error, 400);
    }

    const project = await projectService.createProject(req.user.id, validation.data);
    return sendSuccess(res, project, 'Project created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const validation = validateUpdateProject(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.error, 400);
    }

    const project = await projectService.updateProject(req.user.id, id, validation.data);
    return sendSuccess(res, project, 'Project updated successfully.', 200);
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const result = await projectService.deleteProject(req.user.id, id);
    return sendSuccess(res, result, 'Project deleted successfully.', 200);
  } catch (err) {
    next(err);
  }
}
