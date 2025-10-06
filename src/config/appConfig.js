/**
 * Application Configuration
 * Single source of truth for the entire application
 */

// Get API base URL from environment variable (Netlify)
// Falls back to testing API if not set
const getApiBaseUrl = () => {
  // Check for Vite environment variable (set in Netlify)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Default fallback for local development
  return 'https://men4u.xyz/v2';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(), // Full URL including /v2
};

// Protected Users Configuration
export const PROTECTED_USERS = {
  ADMIN_MOBILES: ["8806431723", "9767637798", "8600704616"],
  // Add other protected user types if needed
};

// Export a default configuration object if needed
export default {
  API_CONFIG,
};
