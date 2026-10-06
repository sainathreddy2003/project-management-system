import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/services.js';
import { setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);

  useEffect(() => {
    // Register unauthorized handler for 401s from the API client
    setUnauthorizedHandler((message) => {
      setUser(null);
      setToken(null);
      setSessionExpiredMessage(message || 'Your session expired. Please sign in again.');
    });

    async function bootstrap() {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        const storedUser = await SecureStore.getItemAsync('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        // Ignore read errors
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const { user: userData, accessToken } = res.data;
      await SecureStore.setItemAsync('token', accessToken);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      setSessionExpiredMessage(null);
      return userData;
    }
    throw new Error(res.error || 'Login failed.');
  };

  const register = async (fullName, email, password) => {
    const res = await authApi.register({ fullName, email, password });
    if (res.success && res.data) {
      const { user: userData, accessToken } = res.data;
      await SecureStore.setItemAsync('token', accessToken);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      setSessionExpiredMessage(null);
      return userData;
    }
    throw new Error(res.error || 'Registration failed.');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        sessionExpiredMessage,
        setSessionExpiredMessage,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
