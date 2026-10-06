import { apiClient } from './client.js';

export const authApi = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  register: async (data) => {
    return apiClient.post('/auth/register', data);
  },
  logout: async (refreshToken) => {
    return apiClient.post('/auth/logout', { refreshToken });
  },
  getMe: async () => {
    return apiClient.get('/auth/me');
  },
};

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

export const dashboardApi = {
  getDashboard: async () => {
    return apiClient.get('/dashboard');
  },
};
