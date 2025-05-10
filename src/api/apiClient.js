/**
 * API Client for making authenticated requests
 */
import tokenService from '@/services/tokenService';
import { API_URL } from './config';

const apiClient = {
  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response
   */
  request: async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth header if available
    const authHeader = tokenService.getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Prepare request options
    const requestOptions = {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    };

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint,
          data: options.body,
          method: options.method || 'GET',
          headers: authHeader ? { Authorization: authHeader } : undefined
        })
      });

      const data = await response.json();

      // Handle unauthorized responses
      if (response.status === 401) {
        tokenService.clearAuthData();
        window.location.href = '/auth/login';
        throw new Error('Unauthorized');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   */
  get: (endpoint, options = {}) => {
    return apiClient.request(endpoint, { ...options, method: 'GET' });
  },

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   */
  post: (endpoint, data, options = {}) => {
    return apiClient.request(endpoint, {
      ...options,
      method: 'POST',
      body: data
    });
  },

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   */
  put: (endpoint, data, options = {}) => {
    return apiClient.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data
    });
  },

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   */
  delete: (endpoint, options = {}) => {
    return apiClient.request(endpoint, { ...options, method: 'DELETE' });
  }
};

export default apiClient; 