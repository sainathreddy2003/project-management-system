import { apiClient } from './client.js';

export const dashboardApi = {
  getDashboard: async () => {
    return apiClient.get('/dashboard');
  },
};
