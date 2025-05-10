import { getAuthHeaders } from '@/utils/apiUtils';
import { debugAuthToken } from '@/utils/debug';
import { ENDPOINTS } from '@/api/config';
import tokenService from '@/services/tokenService';

/**
 * Outlet Service - Handles all API calls related to outlets
 */
const outletService = {
  /**
   * Get all outlets
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Response data containing list of outlets
   */
  getAllOutlets: (params = {}) => {
    return fetch('/api/proxy', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        endpoint: '/common/listview_outlet',
        data: {
          ...params
        }
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch outlets');
      }
      return response.json();
    })
    .then(data => {
      if (data.detail?.includes('Error with token')) {
        throw new Error('Authentication error: ' + data.detail);
      }
      return data;
    })
    .catch(error => {
      console.error('Error fetching outlets:', error);
      throw error;
    });
  },

  /**
   * Get outlet details by ID
   * @param {number} outletId - ID of the outlet
   * @returns {Promise<Object>} - Response data containing outlet details
   */
  getOutletDetails: (outletId) => {
    return fetch('/api/proxy', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        endpoint: '/common/view_outlet',
        data: {
          outlet_id: outletId
        }
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch outlet details');
      }
      return response.json();
    })
    .then(data => {
      if (data.detail?.includes('Error with token')) {
        throw new Error('Authentication error: ' + data.detail);
      }
      return data;
    })
    .catch(error => {
      console.error('Error fetching outlet details:', error);
      throw error;
    });
  },

  /**
   * Create a new outlet
   * @param {Object} formData - Outlet data
   * @returns {Promise<Object>} - Response data
   */
  createOutlet: async (formData) => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData, // FormData will be sent directly
      });

      if (!response.ok) {
        throw new Error('Failed to create outlet');
      }

      const data = await response.json();
      if (data.detail?.includes('Error with token')) {
        throw new Error('Authentication error: ' + data.detail);
      }
      return data;
    } catch (error) {
      console.error('Error creating outlet:', error);
      throw error;
    }
  },

  /**
   * Update an existing outlet
   * @param {Object} outletData - Outlet data with ID
   * @returns {Promise<Object>} - Response data
   */
  updateOutlet: async (outletData) => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST', // Changed from PATCH to POST
        headers: getAuthHeaders(),
        body: JSON.stringify({
          endpoint: '/common/update_outlet',
          data: outletData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update outlet');
      }

      const data = await response.json();
      if (data.detail?.includes('Error with token')) {
        throw new Error('Authentication error: ' + data.detail);
      }
      return data;
    } catch (error) {
      console.error('Error updating outlet:', error);
      throw error;
    }
  },

  /**
   * Delete an outlet
   * @param {number} outletId - ID of outlet to delete
   * @returns {Promise<Object>} - Response data
   */
  deleteOutlet: (outletId) => {
    return fetch('/api/proxy', {
      method: 'POST', // Changed from DELETE to POST
      headers: getAuthHeaders(),
      body: JSON.stringify({
        endpoint: '/common/delete_outlet',
        data: {
          outlet_id: outletId
        }
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete outlet');
      }
      return response.json();
    })
    .then(data => {
      if (data.detail?.includes('Error with token')) {
        throw new Error('Authentication error: ' + data.detail);
      }
      return data;
    })
    .catch(error => {
      console.error('Error deleting outlet:', error);
      throw error;
    });
  },

  // List all outlets
  listOutlets: async (userId) => {
    try {
      console.log('Fetching outlets for user:', userId);
      
      // Get auth header from tokenService instead of direct localStorage access
      const authHeader = tokenService.getAuthHeader();
      
      if (!authHeader) {
        console.error('No authorization token available');
        throw new Error('Authentication required');
      }

      console.log('Using auth header:', authHeader);
      
      // Use the common endpoint for listview_outlet
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          endpoint: '/common/listview_outlet', 
          data: {
            user_id: userId
          }
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.detail || `Failed to fetch outlets: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.detail?.includes('Error with token')) {
        console.error('Authentication error:', data.detail);
        throw new Error('Authentication error: ' + data.detail);
      }

      return data;
    } catch (error) {
      console.error('Error fetching outlets:', error);
      throw error;
    }
  },

  // View outlet details
  viewOutlet: async (outletId, userId) => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          endpoint: '/common/view_outlet',
          data: {
            outlet_id: outletId,
            user_id: userId
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch outlet details');
      }

      const data = await response.json();
      if (data.detail?.includes('Error with token')) {
        throw new Error('Authentication error: ' + data.detail);
      }
      return data;
    } catch (error) {
      console.error('Error fetching outlet details:', error);
      throw error;
    }
  },
};

export default outletService; 