/**
 * Development mode configuration
 * This file contains settings specific to local development environment
 */

// Debug flag - set to true to enable additional console logging
export const DEBUG = false; // Setting to false to reduce console noise

// Use direct API calls by default in development to avoid CORS issues
// If false, it will try to use API proxy route, which may fail if not properly configured
export const USE_DIRECT_API_CALLS = true;

// Log API calls in development
export const logApiCall = (endpoint, method, data) => {
  if (DEBUG && typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.group(`🔄 API Request: ${method} ${endpoint}`);
    console.log('Method:', method);
    console.log('Endpoint:', endpoint);
    if (data) console.log('Payload:', data);
    console.groupEnd();
  }
};

// Log API responses in development
export const logApiResponse = (endpoint, response, error = null) => {
  if (DEBUG && typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    if (error) {
      console.group(`❌ API Error: ${endpoint}`);
      console.error('Error:', error);
      console.groupEnd();
    } else {
      console.group(`✅ API Response: ${endpoint}`);
      console.log('Response:', response);
      console.groupEnd();
    }
  }
}; 