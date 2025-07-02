import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toastController } from '../utils/toastController';

export const useAuth = () => {
  const navigate = useNavigate();
  const [authData, setAuthData] = useState(() => {
    // Initialize from localStorage if exists
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : null;
  });

  // Define logout as useCallback to prevent stale closures
  const logout = useCallback(() => {
    setAuthData(null);
    localStorage.removeItem('auth');
    navigate('/login');
  }, [navigate]); // Only depends on navigate

  // Move interceptor after logout definition
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Check if we're not already on login page to prevent loops
          if (window.location.pathname !== '/login') {
            toastController.error('Session expired. Please login again.');
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]); // Add logout as dependency

  // Single source of truth for localStorage management
  useEffect(() => {
    if (authData) {
      localStorage.setItem('auth', JSON.stringify(authData));
    } else {
      localStorage.removeItem('auth');
    }
  }, [authData]);

  const login = (response) => {
    const newAuthData = {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      expires_at: response.data.expires_at,
    };
    setAuthData(newAuthData);
  };

  const isAuthenticated = () => {
    return !!authData && new Date(authData.expires_at) > new Date();
  };

  const getToken = () => {
    return authData ? `${authData.token_type} ${authData.access_token}` : null;
  };

  return {
    authData,
    login,
    logout,
    isAuthenticated,
    getToken,
  };
};

