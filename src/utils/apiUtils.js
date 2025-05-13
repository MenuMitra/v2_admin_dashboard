/**
 * API utility functions
 */

import { API_URL } from '@/api/config';
import { isStaticExport } from '@/utils/staticConfig';

// Flag to check if we're on client side
const isClient = typeof window !== 'undefined';

// Flag to enable CORS proxy in development - only on client side
const USE_CORS_PROXY = isClient && process.env.NODE_ENV !== 'production';

// Conditionally import client-only dependencies
let fetchWithProxy;
let logApiCall;
let logApiResponse;
let DEBUG = false;

// Only import client-side modules on the client
if (isClient) {
  try {
    const devConfig = require('@/utils/devConfig');
    const corsProxy = require('@/utils/corsProxy');
    
    DEBUG = devConfig.DEBUG;
    logApiCall = devConfig.logApiCall;
    logApiResponse = devConfig.logApiResponse;
    fetchWithProxy = corsProxy.fetchWithProxy;
  } catch (e) {
    // Fallback implementations if modules can't be loaded
    DEBUG = false;
    logApiCall = () => {};
    logApiResponse = () => {};
    fetchWithProxy = (url, options) => fetch(url, options);
  }
} else {
  // Server-side stubs
  logApiCall = () => {};
  logApiResponse = () => {};
  fetchWithProxy = (url, options) => fetch(url, options);
}

/**
 * Get the authentication token from localStorage
 * @returns {string|null} - Authentication token or null if not available
 */
export const getAuthToken = () => {
  if (!isClient) {
    return null;
  }
  
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('tokenType') || 'bearer';
  
  if (DEBUG) {
    console.log('Retrieved token from storage, exists:', !!token);
    if (token) {
      console.log('Token length:', token.length, 'First 10 chars:', token.substring(0, 10) + '...');
    }
    console.log('Token type:', tokenType);
  }
  
  if (!token) {
    if (DEBUG) console.log('No token found in storage');
    return null;
  }
  
  // Return raw token without type
  return token;
};

/**
 * Get the authentication header for API requests
 * @param {string} contentType - Optional content type to use (default: application/json)
 * @returns {Object} - Headers object with Authorization if available
 */
export const getAuthHeaders = () => {
  if (!isClient) {
    return { 'Content-Type': 'application/json' };
  }
  
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('tokenType') || 'bearer';
  
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `${tokenType} ${token}`
  };
};

/**
 * Safely get auth header
 * @returns {string|null} Authorization header or null
 */
export const getAuthHeader = () => {
  if (!isClient) {
    return null;
  }
  
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('tokenType') || 'bearer';
  
  if (!token) {
    return null;
  }
  
  return `${tokenType} ${token}`;
};

/**
 * Add authentication to fetch options
 * @param {Object} options - Fetch options object
 * @returns {Object} - Fetch options with authentication headers added
 */
export const addAuthToOptions = (options = {}) => {
  const token = getAuthToken();
  
  if (DEBUG) {
    console.log('Adding auth to options...');
    console.log('Initial options:', options);
  }
  
  if (!token) {
    if (DEBUG) console.log('No token available for options');
    return options;
  }
  
  // Create headers if they don't exist
  if (!options.headers) {
    options.headers = {};
  }
  
  // Add authorization header
  options.headers['Authorization'] = token;
  
  if (DEBUG) console.log('Final options with auth:', options);
  return options;
};

/**
 * Make an API request that works in both static and SSR environments
 * @param {Object} options - Request options
 * @param {string} options.endpoint - API endpoint (e.g., "/admin/login")
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request body data
 * @param {Object} options.headers - Additional headers
 * @param {boolean} options.useFormData - Whether to use FormData
 * @returns {Promise<Object>} Response data
 */
export const makeApiRequest = async ({ 
  endpoint, 
  method = 'GET', 
  data = null, 
  headers = {}, 
  useFormData = false 
}) => {
  try {
    // Log API call for debugging
    if (logApiCall) logApiCall(endpoint, method, data);
    
    // Get auth headers and merge with provided headers
    const authHeaders = getAuthHeaders();
    const requestHeaders = { ...authHeaders, ...headers };
    
    // Prepare the request options
    const requestOptions = {
      method,
      headers: requestHeaders,
      mode: 'cors', // Enable CORS
      credentials: 'omit' // Don't include credentials which can cause CORS issues
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      if (useFormData) {
        // For FormData, remove Content-Type to let the browser set it
        delete requestOptions.headers['Content-Type'];
        requestOptions.body = data;
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }
    
    // Build the URL
    const directUrl = `${API_URL}${endpoint}`;
    if (DEBUG) console.log(`Calling API at: ${directUrl}`);
    
    let response;
    
    // For GET requests with query params in data
    if (method === 'GET' && data && Object.keys(data).length > 0) {
      const queryParams = new URLSearchParams(data).toString();
      const urlWithParams = `${directUrl}?${queryParams}`;
      
      // Use CORS proxy in development
      if (USE_CORS_PROXY && fetchWithProxy) {
        response = await fetchWithProxy(urlWithParams, requestOptions);
      } else {
        response = await fetch(urlWithParams, requestOptions);
      }
    } else {
      // Use CORS proxy in development
      if (USE_CORS_PROXY && fetchWithProxy) {
        response = await fetchWithProxy(directUrl, requestOptions);
      } else {
        response = await fetch(directUrl, requestOptions);
      }
    }
    
    // Parse the response
    let result;
    try {
      result = await response.json();
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Error processing API response - check if backend allows CORS');
    }
    
    // Log API response for debugging
    if (logApiResponse) logApiResponse(endpoint, result);
    
    if (!response.ok) {
      console.error('API error response:', result);
      throw new Error(result.message || result.detail || 'API request failed');
    }
    
    return result;
  } catch (error) {
    // Check for network-related errors (likely CORS)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      console.error('Network error - likely a CORS issue:', error);
    }
    
    // Log the error
    if (logApiResponse) logApiResponse(endpoint, null, error);
    throw error;
  }
}; 