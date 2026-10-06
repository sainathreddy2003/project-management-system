import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// In Android emulator, 10.0.2.2 points to host machine's localhost
const defaultHost = Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';
const baseURL = process.env.EXPO_PUBLIC_API_URL || defaultHost;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorizedCallback = handler;
}

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore read failure fallback
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        try {
          await SecureStore.deleteItemAsync('token');
          await SecureStore.deleteItemAsync('user');
        } catch {}

        if (onUnauthorizedCallback) {
          onUnauthorizedCallback('Your session expired. Please sign in again.');
        }
      }

      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        'Server returned an error.';
      const err = new Error(message);
      err.statusCode = error.response.status;
      return Promise.reject(err);
    }

    if (error.request || !error.status) {
      const offlineError = new Error("You're offline. Check your network connection and try again.");
      offlineError.isOffline = true;
      return Promise.reject(offlineError);
    }

    return Promise.reject(error);
  }
);
