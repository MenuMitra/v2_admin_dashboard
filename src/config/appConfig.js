/**
 * Application Configuration
 * Single source of truth for the entire application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://men4u.xyz',
  VERSION: 'v2',
  ENDPOINTS: {
    ADMIN: {
      LIST: '/admin/list_admins',
      CREATE: '/admin/create_admin',
      UPDATE: '/admin/update_admin',
      DELETE: '/admin/delete_admin',
      UPDATE_STATUS: '/admin/update_admin_status'
    },
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh'
    }
    // Add other endpoint categories as needed
  }
};

// Protected Users Configuration
export const PROTECTED_USERS = {
  ADMIN_MOBILES: [
    '8806431723',
    '9767637798',
    '8600704616'
  ],
  // Add other protected user types if needed
};

// Application Settings
export const APP_CONFIG = {
  NAME: 'MenuMitra Admin Dashboard',
  VERSION: '1.0.0',
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
  },
  DATE_FORMAT: 'DD MMM YYYY',
  // Add other app-wide settings
};

// Feature Flags
export const FEATURES = {
  ENABLE_BULK_ACTIONS: true,
  ENABLE_EXPORT: true,
  ENABLE_IMPORT: true
  // Add other feature flags
};

// Environment-specific Configuration
export const ENV_CONFIG = {
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  // Add other environment-specific settings
};

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${endpoint}`;
};

// Helper function to check if a user is protected
export const isProtectedUser = (mobile) => {
  return PROTECTED_USERS.ADMIN_MOBILES.includes(mobile);
};

// Export a default configuration object if needed
export default {
  API_CONFIG,
  PROTECTED_USERS,
  APP_CONFIG,
  FEATURES,
  ENV_CONFIG,
  getApiUrl,
  isProtectedUser
}; 