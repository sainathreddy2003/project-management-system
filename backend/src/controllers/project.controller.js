import { validateCreateProject, validateUpdateProject, parseProjectQuery } from '../validators/project.validator.js';
import * as ProjectModel from '../models/project.model.js';
import { renderSuccess, renderError } from '../views/response.view.js';

/**
 * PROJECT CONTROLLER
 * Handles HTTP requests for project resources, validates inputs, and interacts with ProjectModel.
 */

export async function listProjects(req, res, next) {
  try {
    const queryParams = parseProjectQuery(req.query);
    const result = await ProjectModel.listProjects(req.user.id, queryParams);
    return renderSuccess(res, result.data, null, 200, result.pagination);
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const { id } = req.params;
    const project = await ProjectModel.getProjectById(req.user.id, id);
    return renderSuccess(res, project, null, 200);
  } catch (err) {
    next(err);
  }
}

export async function createProject(req, res, next) {
  try {
    const validation = validateCreateProject(req.body);
    if (!validation.isValid) {
      return renderError(res, validation.error, 400);
    }

    const project = await ProjectModel.createProject(req.user.id, validation.data);
    return renderSuccess(res, project, 'Project created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const validation = validateUpdateProject(req.body);
    if (!validation.isValid) {
      return renderError(res, validation.error, 400);
    }

    const project = await ProjectModel.updateProject(req.user.id, id, validation.data);
    return renderSuccess(res, project, 'Project updated successfully.', 200);
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const result = await ProjectModel.deleteProject(req.user.id, id);
    return renderSuccess(res, result, 'Project deleted successfully.', 200);
  } catch (err) {
    next(err);
  }
}
