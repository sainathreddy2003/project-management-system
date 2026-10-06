import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);

  useEffect(() => {
    // Check for expired session flag from sessionStorage or query param
    const storedError = sessionStorage.getItem('authError');
    if (storedError) {
      setSessionExpiredMessage(storedError);
      sessionStorage.removeItem('authError');
    }

    async function loadUser() {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      const { user: userData, accessToken } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      setSessionExpiredMessage(null);
      return userData;
    }
    throw new Error(response.error || 'Login failed.');
  };

  const register = async (fullName, email, password) => {
    const response = await authApi.register({ fullName, email, password });
    if (response.success && response.data) {
      const { user: userData, accessToken } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      setSessionExpiredMessage(null);
      return userData;
    }
    throw new Error(response.error || 'Registration failed.');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
        isAuthenticated: !!user,
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
