import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const [authData, setAuthData] = useState(() => {
    // Initialize from localStorage if exists
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : null;
  });

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

  const logout = () => {
    setAuthData(null);  // useEffect will handle localStorage cleanup
    navigate('/login');
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

