/**
 * Authentication service for admin login and OTP verification
 */
import apiClient from '../apiClient';
import tokenService from '@/services/tokenService';
import { ENDPOINTS } from '../config';

const authService = {
  /**
   * Admin Login with mobile number
   * @param {string} mobile - Admin's mobile number
   * @returns {Promise<Object>} - Response with status and message
   */
  login: (mobile) => {
    return fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '/admin/admin_login',
        data: { mobile }
      }),
    }).then(response => response.json());
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
        endpoint: '/common/resend_otp',
        data: { mobile }
      }),
    }).then(response => response.json());
  },

  /**
   * Verify Admin OTP and handle login response
   * @param {Object} data - Verification data
   * @param {string} data.mobile - Admin's mobile number
   * @param {string} data.otp - OTP code
   * @returns {Promise<Object>} - Response with user data and auth token
   */
  verifyOtp: async (data) => {
    console.log('Verifying OTP with data:', data);
    
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '/admin/admin_verify_otp',
        data: {
          mobile: data.mobile,
          otp: data.otp
        }
      }),
    }).then(response => response.json());

    console.log('OTP verification response:', response);

    // If login is successful, store auth data
    if (response.detail === 'Login successful' && response.access_token) {
      console.log('Login successful, storing auth data...');
      
      // Store auth data in localStorage
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('tokenType', response.token_type || 'bearer');
      localStorage.setItem('userId', response.user_id);
      localStorage.setItem('userName', response.name);
      localStorage.setItem('userEmail', response.email);
      localStorage.setItem('userRole', response.role);
      localStorage.setItem('userMobile', response.mobile);
      localStorage.setItem('tokenExpiry', response.expires_at);

      // Verify stored data
      console.log('Stored auth token:', localStorage.getItem('authToken'));
      console.log('Stored token type:', localStorage.getItem('tokenType'));
      console.log('Auth header will be:', `${localStorage.getItem('tokenType')} ${localStorage.getItem('authToken')}`);
    } else {
      console.log('Login not successful or missing access token');
    }
    
    return response;
  },

  /**
   * Logout user and clear auth data
   */
  logout: () => {
    console.log('Logging out, clearing auth data...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userMobile');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('mobileNumber');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');
    
    console.log('Checking authentication...');
    console.log('Token exists:', !!token);
    console.log('Token expiry:', expiry);
    
    if (!token || !expiry) {
      console.log('No token or expiry found');
      return false;
    }
    
    // Check if token is expired
    const expiryDate = new Date(expiry);
    if (expiryDate < new Date()) {
      console.log('Token expired, clearing storage');
      // Token expired, clear storage
      authService.logout();
      return false;
    }
    
    console.log('User is authenticated');
    return true;
  },

  /**
   * Get current user data
   * @returns {Object} User data
   */
  getCurrentUser: () => {
    if (!authService.isAuthenticated()) return null;
    
    return {
      id: localStorage.getItem('userId'),
      name: localStorage.getItem('userName'),
      email: localStorage.getItem('userEmail'),
      role: localStorage.getItem('userRole'),
      mobile: localStorage.getItem('userMobile')
    };
  }
};

export default authService; 