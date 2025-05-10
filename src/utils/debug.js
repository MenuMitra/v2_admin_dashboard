/**
 * Debugging utilities for the application
 */

/**
 * Debug the authentication token and format
 * @returns {Object} Debug information about the current token
 */
export const debugAuthToken = () => {
  if (typeof window === 'undefined') {
    return { error: 'Running on server side' };
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const tokenType = localStorage.getItem('tokenType') || 'bearer';
    const expiryDate = localStorage.getItem('tokenExpiry');
    
    const info = {
      exists: !!token,
      length: token ? token.length : 0,
      type: tokenType,
      expiry: expiryDate,
      isExpired: expiryDate ? new Date(expiryDate) < new Date() : true,
      preview: token ? `${token.substring(0, 10)}...` : null,
      formatted: token ? `${tokenType} ${token.substring(0, 10)}...` : null
    };
    
    console.log('Auth Token Debug Info:', info);
    return info;
  } catch (error) {
    console.error('Error debugging token:', error);
    return { error: error.message };
  }
};

/**
 * Check if the token is valid
 * @returns {boolean} True if the token is valid, false otherwise
 */
export const isValidToken = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  const expiryDate = localStorage.getItem('tokenExpiry');
  
  if (!token || !expiryDate) {
    return false;
  }
  
  // Check if token is expired
  return new Date(expiryDate) >= new Date();
};

/**
 * Clear all auth data from localStorage and log the action
 */
export const clearAuthData = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  console.log('Clearing all auth data from localStorage');
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userMobile');
  localStorage.removeItem('tokenExpiry');
};

export default {
  debugAuthToken,
  isValidToken,
  clearAuthData
}; 