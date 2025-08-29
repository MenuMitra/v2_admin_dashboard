/**
 * Application Configuration
 * Single source of truth for the entire application
 */

// Helper function to safely check domain
const isMenuMitraDomain = () => {
  try {
    const hostname = window.location.hostname;
    // Check for exact domain matches
    return hostname === 'admin.menumitra.com' || 
           hostname === 'menumitra.com' || 
           hostname.endsWith('.menumitra.com');
  } catch (error) {
    console.error('Error checking domain:', error);
    return false;
  }
};

// Helper function to get API base URL
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // For all domains including localhost, use domain-based logic
  return isMenuMitraDomain() 
    ? 'https://ghanish.in' 
    : 'https://menusmitra.xyz';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
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