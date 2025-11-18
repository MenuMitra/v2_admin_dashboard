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
  return "https://ghanish.in/v2";
  
};

// Get Customer App base URL from environment variable (Netlify)
// Falls back to testing app if not set
const getCustomerAppUrl = () => {
  // Check for Vite environment variable (set in Netlify)
  if (import.meta.env.VITE_CUSTOMER_APP_URL) {
    return import.meta.env.VITE_CUSTOMER_APP_URL;
  }
  
  // Default fallback for local development
  return 'https://test-menumitra-customer-v2.netlify.app';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(), // Full URL including /v2
  CUSTOMER_APP_URL: getCustomerAppUrl(), // Customer app base URL
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
