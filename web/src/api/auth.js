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
