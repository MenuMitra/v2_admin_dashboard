/**
 * Token management service for handling authentication tokens
 */

const TOKEN_KEYS = {
  AUTH_TOKEN: 'authToken',
  TOKEN_TYPE: 'tokenType',
  USER_ID: 'userId',
  USER_NAME: 'userName',
  USER_EMAIL: 'userEmail',
  USER_ROLE: 'userRole',
  USER_MOBILE: 'userMobile',
  TOKEN_EXPIRY: 'tokenExpiry'
};

const tokenService = {
  /**
   * Store authentication data in localStorage
   * @param {Object} authData - Authentication data from server
   */
  setAuthData: (authData) => {
    if (!authData) return;
    
    const {
      access_token,
      token_type,
      user_id,
      name,
      email,
      role,
      mobile,
      expires_at
    } = authData;

    localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, access_token);
    localStorage.setItem(TOKEN_KEYS.TOKEN_TYPE, token_type);
    localStorage.setItem(TOKEN_KEYS.USER_ID, user_id);
    localStorage.setItem(TOKEN_KEYS.USER_NAME, name);
    localStorage.setItem(TOKEN_KEYS.USER_EMAIL, email);
    localStorage.setItem(TOKEN_KEYS.USER_ROLE, role);
    localStorage.setItem(TOKEN_KEYS.USER_MOBILE, mobile);
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expires_at);
  },

  /**
   * Get the full authorization header value
   * @returns {string|null} Authorization header value
   */
  getAuthHeader: () => {
    const token = localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN);
    const tokenType = localStorage.getItem(TOKEN_KEYS.TOKEN_TYPE);
    
    if (!token || !tokenType) return null;
    return `${tokenType} ${token}`;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN);
    const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
    
    if (!token || !expiry) return false;
    
    // Convert expiry date string to timestamp
    const expiryDate = new Date(expiry).getTime();
    const now = new Date().getTime();
    
    return token && expiryDate > now;
  },

  /**
   * Get user data
   * @returns {Object} User data
   */
  getUserData: () => {
    return {
      id: localStorage.getItem(TOKEN_KEYS.USER_ID),
      name: localStorage.getItem(TOKEN_KEYS.USER_NAME),
      email: localStorage.getItem(TOKEN_KEYS.USER_EMAIL),
      role: localStorage.getItem(TOKEN_KEYS.USER_ROLE),
      mobile: localStorage.getItem(TOKEN_KEYS.USER_MOBILE)
    };
  },

  /**
   * Clear all auth data from localStorage
   */
  clearAuthData: () => {
    Object.values(TOKEN_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('mobileNumber'); // Also clear mobile used for OTP
  }
};

export default tokenService; 