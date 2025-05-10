/**
 * API utility functions
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} - Authentication token or null if not available
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('tokenType') || 'bearer';
  
  if (!token) return null;
  
  return `${tokenType} ${token}`;
};

/**
 * Get the authentication header for API requests
 * @returns {Object} - Headers object with Authorization if available
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = token;
  }
  
  return headers;
};

/**
 * Add authentication to fetch options
 * @param {Object} options - Fetch options object
 * @returns {Object} - Fetch options with authentication headers added
 */
export const addAuthToOptions = (options = {}) => {
  const token = getAuthToken();
  
  if (!token) return options;
  
  // Create headers if they don't exist
  if (!options.headers) {
    options.headers = {};
  }
  
  // Add authorization header
  options.headers['Authorization'] = token;
  
  return options;
}; 