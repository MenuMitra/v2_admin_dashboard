/**
 * Application Configuration
 * Single source of truth for the entire application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_IS_DEV === 'true' 
    ? 'https://men4u.xyz' 
    : 'https://menusmitra.xyz',
  API_VERSION: 'v2',
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


// Export a default configuration object if needed
export default {
  API_CONFIG
}; 