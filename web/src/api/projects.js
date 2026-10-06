import { apiClient } from './client.js';

export const projectsApi = {
  getProjects: async (params = {}) => {
    return apiClient.get('/projects', { params });
  },
  getProject: async (id) => {
    return apiClient.get(`/projects/${id}`);
  },
  createProject: async (data) => {
    return apiClient.post('/projects', data);
  },
  updateProject: async (id, data) => {
    return apiClient.put(`/projects/${id}`, data);
  },
  deleteProject: async (id) => {
    return apiClient.delete(`/projects/${id}`);
  },
};
