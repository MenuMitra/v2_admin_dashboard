/**
 * API utility functions
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} - Authentication token or null if not available
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') {
    console.log('Running on server side, no token available');
    return null;
  }
  
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('tokenType') || 'bearer';
  
  console.log('Retrieved token from storage, exists:', !!token);
  if (token) {
    console.log('Token length:', token.length, 'First 10 chars:', token.substring(0, 10) + '...');
  }
  console.log('Token type:', tokenType);
  
  if (!token) {
    console.log('No token found in storage');
    return null;
  }
  
  // Return raw token without type
  return token;
};

/**
 * Get the authentication header for API requests
 * @returns {Object} - Headers object with Authorization if available
 */
export const getAuthHeaders = () => {
  console.log('Getting auth headers...');
  const token = getAuthToken();
  const tokenType = localStorage.getItem('tokenType') || 'bearer';
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    console.log('Adding Authorization header');
    // Format token with type
    const authHeader = `${tokenType} ${token}`;
    headers['Authorization'] = authHeader;
    console.log('Authorization header format:', `${tokenType} ${token.substring(0, 10)}...`);
  }
  
  console.log('Final headers:', headers);
  return headers;
};

/**
 * Add authentication to fetch options
 * @param {Object} options - Fetch options object
 * @returns {Object} - Fetch options with authentication headers added
 */
export const addAuthToOptions = (options = {}) => {
  const token = getAuthToken();
  
  console.log('Adding auth to options...');
  console.log('Initial options:', options);
  
  if (!token) {
    console.log('No token available for options');
    return options;
  }
  
  // Create headers if they don't exist
  if (!options.headers) {
    options.headers = {};
  }
  
  // Add authorization header
  options.headers['Authorization'] = token;
  
  console.log('Final options with auth:', options);
  return options;
}; 