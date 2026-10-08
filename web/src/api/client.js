import axios from 'axios';

// Base URL resolution with normalization for deployed environments
const envURL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').trim();
const cleanURL = envURL.replace(/\/+$/, '');
const baseURL = cleanURL.endsWith('/api') ? cleanURL : `${cleanURL}/api`;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 401: Unauthorized / Session Expired
      if (error.response.status === 401) {
        const hadToken = !!localStorage.getItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (hadToken && !window.location.pathname.includes('/login')) {
          sessionStorage.setItem('authError', 'Your session expired. Please sign in again.');
          window.location.href = '/login?expired=true';
        }
      }
      const message = error.response.data?.error || error.response.data?.message || 'Server error occurred.';
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error('Network error. Unable to reach server. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);
