import * as dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getDashboard(req, res, next) {
  try {
    const data = await dashboardService.getDashboardMetrics(req.user.id);
    return sendSuccess(res, data, null, 200);
  } catch (err) {
    next(err);
  }
}
