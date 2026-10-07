import * as DashboardModel from '../models/dashboard.model.js';
import { renderSuccess } from '../views/response.view.js';

/**
 * DASHBOARD CONTROLLER
 * Handles HTTP requests for aggregated executive metrics and charts from DashboardModel.
 */

export async function getDashboard(req, res, next) {
  try {
    const data = await DashboardModel.getDashboardMetrics(req.user.id);
    return renderSuccess(res, data, null, 200);
  } catch (err) {
    next(err);
  }
}
