/**
 * Static deployment configuration
 * This file contains settings that are used when the app is deployed as a static site
 */

// Base API URL - used for direct API calls in static deployment
export const API_BASE_URL = 'https://men4u.xyz/v2';

// Check if we're in a static export environment - only true when explicitly set
export const isStaticExport = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

// For testing and debug purposes
console.log('Static export mode:', isStaticExport ? 'enabled' : 'disabled');

// Function to get the appropriate API URL based on deployment type
export const getApiUrl = (endpoint) => {
  // Always return the direct API URL - we're no longer using the proxy
  return `${API_BASE_URL}${endpoint}`;
};

// Static API client that can be used for direct API calls in static deployments
export const staticApiClient = {
  /**
   * Make a request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - The API response
   */
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Configure request options
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    // Add body if provided
    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }
    
    try {
      const response = await fetch(url, requestOptions);
      
      // Parse the response as JSON
      const data = await response.json();
      
      // Handle error responses
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
  
  // Convenience methods for different HTTP methods
  get: (endpoint, options = {}) => {
    return staticApiClient.request(endpoint, { ...options, method: 'GET' });
  },
  
  post: (endpoint, data, options = {}) => {
    return staticApiClient.request(endpoint, { ...options, method: 'POST', body: data });
  },
  
  put: (endpoint, data, options = {}) => {
    return staticApiClient.request(endpoint, { ...options, method: 'PUT', body: data });
  },
  
  delete: (endpoint, options = {}) => {
    return staticApiClient.request(endpoint, { ...options, method: 'DELETE' });
  }
}; 