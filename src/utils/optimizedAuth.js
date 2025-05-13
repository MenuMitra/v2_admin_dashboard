/**
 * Optimized authentication utility functions with caching to improve performance
 */

// Local cache for auth data to avoid repeated localStorage calls
let authDataCache = null;
let isAuthenticatedCache = null;
let lastCheckedTime = 0;

// Cache duration of 5 minutes for auth data
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Get cached user data - much faster than accessing localStorage every time
 * @returns {Object} User data
 */
export const getCachedUserData = () => {
  const now = Date.now();
  
  // If we have cached data and it's not expired, return it
  if (authDataCache && (now - lastCheckedTime < CACHE_DURATION)) {
    return authDataCache;
  }
  
  try {
    // Otherwise fetch from localStorage and update cache
    const userData = {
      id: localStorage.getItem('userId'),
      name: localStorage.getItem('userName'),
      email: localStorage.getItem('userEmail'),
      role: localStorage.getItem('userRole'),
      mobile: localStorage.getItem('userMobile'),
      expires_at: localStorage.getItem('tokenExpiry')
    };
    
    // Don't cache empty data
    if (userData.name) {
      authDataCache = userData;
      lastCheckedTime = now;
    }
    
    return userData;
  } catch (error) {
    console.error('Error retrieving cached user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated with caching for performance
 * @returns {boolean}
 */
export const isCachedAuthenticated = () => {
  const now = Date.now();
  
  // Return cached result if not expired
  if (isAuthenticatedCache !== null && (now - lastCheckedTime < CACHE_DURATION)) {
    return isAuthenticatedCache;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !expiry) {
      isAuthenticatedCache = false;
      lastCheckedTime = now;
      return false;
    }
    
    // Convert expiry date string to timestamp
    const expiryDate = new Date(expiry).getTime();
    
    isAuthenticatedCache = token && expiryDate > now;
    lastCheckedTime = now;
    
    return isAuthenticatedCache;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Clears cache when logging out or invalidating auth
 */
export const invalidateAuthCache = () => {
  authDataCache = null;
  isAuthenticatedCache = null;
  lastCheckedTime = 0;
}; 