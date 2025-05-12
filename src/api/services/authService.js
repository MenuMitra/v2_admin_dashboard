/**
 * Authentication service for admin login and OTP verification
 */
import apiClient from '../apiClient';
import tokenService from '@/services/tokenService';
import { ENDPOINTS, BASE_URLS } from '../config';

const authService = {
  /**
   * Admin Login with mobile number
   * @param {string} mobile - Admin's mobile number
   * @returns {Promise<Object>} - Response with status and message
   */
  login: async (mobile) => {
    try {
      // Get device information
      
      
     
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/admin${ENDPOINTS.ADMIN.ADMIN_LOGIN}`,
          data: { 
            mobile,
           
          }
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Resend OTP for admin
   * @param {string} mobile - Admin's mobile number
   * @returns {Promise<Object>} - Response with status and message
   */
  resendOtp: (mobile) => {
    return fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `/common${ENDPOINTS.COMMON.RESEND_OTP}`,
        data: { mobile }
      }),
    }).then(response => response.json());
  },

  /**
   * Generate a unique device ID or retrieve the stored one
   * @returns {string} Device ID
   */
 

  /**
   * Verify Admin OTP and handle login response
   * @param {Object} data - Verification data
   * @param {string} data.mobile - Admin's mobile number
   * @param {string} data.otp - OTP code
   * @returns {Promise<Object>} - Response with user data and auth token
   */
  verifyOtp: async (data) => {
    console.log('Verifying OTP with data:', data);
    
    try {
      // Using the admin-specific endpoint with just mobile and OTP
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/admin${ENDPOINTS.ADMIN.ADMIN_VERIFY_OTP}`,
          data: {
            mobile: data.mobile,
            otp: data.otp
          }
        }),
      });

      if (!response.ok) {
        console.error('OTP verification failed with status:', response.status);
        throw new Error('OTP verification failed');
      }

      const responseData = await response.json();
      console.log('OTP verification response:', responseData);

      // If login is successful, store auth data
      if (responseData.access_token) {
        console.log('Login successful, storing auth data...');
        
        // Prepare auth data for storage
        const authData = {
          access_token: responseData.access_token,
          token_type: responseData.token_type || 'bearer',
          user_id: responseData.user_id,
          name: responseData.name,
          email: responseData.email,
          role: responseData.role,
          mobile: responseData.mobile || data.mobile,
          expires_at: responseData.expires_at
        };
        
        // Log auth data for debugging
        console.log('Auth data to be stored:', authData);
        
        // Use tokenService to store auth data
        tokenService.setAuthData(authData);
        
        // Double-check stored data
        const storedData = tokenService.getUserData();
        console.log('Stored user data:', storedData);
        
        // Log success for debugging
        console.log('Auth data stored successfully');
        console.log('Auth header will be:', tokenService.getAuthHeader());
      } else {
        console.log('Login not successful or missing access token');
        throw new Error(responseData.detail || 'Login failed');
      }
      
      return responseData;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  /**
   * Logout user and clear auth data
   */
  logout: () => {
    console.log('Logging out, clearing auth data...');
    tokenService.clearAuthData();
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return tokenService.isAuthenticated();
  },

  /**
   * Get current user data
   * @returns {Object} User data
   */
  getCurrentUser: () => {
    if (!authService.isAuthenticated()) return null;
    return tokenService.getUserData();
  }
};

export default authService; 