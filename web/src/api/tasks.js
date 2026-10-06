import { apiClient } from './client.js';

export const tasksApi = {
  getTasks: async (params = {}) => {
    return apiClient.get('/tasks', { params });
  },
  getTask: async (id) => {
    return apiClient.get(`/tasks/${id}`);
  },
  createTask: async (data) => {
    return apiClient.post('/tasks', data);
  },
  updateTask: async (id, data) => {
    return apiClient.put(`/tasks/${id}`, data);
  },
  deleteTask: async (id) => {
    return apiClient.delete(`/tasks/${id}`);
  },
};
