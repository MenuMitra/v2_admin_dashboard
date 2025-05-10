// Simple API exports
import api from './client';
import authService from './services/authService';

import templateService from './services/templateService';
import { API_URL, BASE_URLS, ENDPOINTS } from './config';

// Export configuration directly
export { API_URL, BASE_URLS, ENDPOINTS };

// Export services
export { authService, templateService };

// Export API client
export { api };

// Export as default
export default {
  api,
  authService,
  templateService,
  API_URL,
  BASE_URLS,
  ENDPOINTS
}; 