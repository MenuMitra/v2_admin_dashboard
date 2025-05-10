/**
 * Authentication utilities
 */

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  const expiryDate = localStorage.getItem('tokenExpiry');
  
  if (!token) {
    return false;
  }
  
  // Check if token is expired
  if (expiryDate) {
    const expiry = new Date(expiryDate);
    if (expiry < new Date()) {
      // Token expired, clear storage
      clearAuthData();
      return false;
    }
  }
  
  return true;
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('tokenExpiry');
  // Don't remove deviceId as it's used for device identification
};

/**
 * Get user data from localStorage
 * @returns {Object} User data object or null
 */
export const getUserData = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!isAuthenticated()) {
    return null;
  }
  
  return {
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('userName'),
    role: localStorage.getItem('userRole'),
  };
};

/**
 * Set current API environment (dev/prod)
 * @param {string} env - Environment name ('dev' or 'prod')
 */
export const setApiEnvironment = (env) => {
  if (typeof window === 'undefined') {
    return;
  }
  
  if (env === 'dev' || env === 'prod') {
    localStorage.setItem('apiEnvironment', env);
    // Reload to apply changes
    window.location.reload();
  }
};

/**
 * Get current API environment
 * @returns {string} Current environment ('dev' or 'prod')
 */
export const getApiEnvironment = () => {
  if (typeof window === 'undefined') {
    return 'dev'; // Default to dev
  }
  
  return localStorage.getItem('apiEnvironment') || 'dev';
}; 