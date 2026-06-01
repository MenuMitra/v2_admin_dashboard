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
    navigate('/');
  }, [navigate]); // Only depends on navigate

  // Move interceptor after logout definition
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Check if we're not already on login page to prevent loops
          if (window.location.pathname !== '/') {
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
    const data = response.data ?? response;
    const accessToken = data.token || data.access_token || null;
    const newAuthData = {
      access_token: accessToken,
      role: data.role || null,
      mobile: data.mobile ?? data.user?.mobile ?? null,
      refresh_token: data.refresh_token || null,
      token_type: data.token_type || 'Bearer',
      expires_on: data.expires_at || data.expires_on || null,
      user_id: data.user?.id ?? data.user_id ?? null,
    };
    setAuthData(newAuthData);
  };

  const isAuthenticated = useCallback(() => {
    if (!authData) {
      return false;
    }

    // PIN login may return role only (no JWT in body)
    if (authData.role && !authData.access_token) {
      return true;
    }

    if (!authData.access_token) {
      return false;
    }

    if (!authData.expires_on) {
      return true;
    }

    try {
      const expirationDate = new Date(authData.expires_on);
      const currentDate = new Date();
      return !isNaN(expirationDate.getTime()) && expirationDate > currentDate;
    } catch {
      return false;
    }
  }, [authData]);

  const getToken = useCallback(() => {
    if (!authData?.access_token) {
      return null;
    }
    const token = authData.access_token;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, [authData]);

  const getUserId = useCallback(() => {
    return authData ? authData.user_id : null;
  }, [authData]);

  return {
    authData,
    login,
    logout,
    isAuthenticated,
    getToken,
    getUserId,
  };
};

