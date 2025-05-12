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
      // Check if formData is a FormData instance
      if (formData instanceof FormData) {
        // If it's FormData, we need to add the endpoint to it
        formData.append('endpoint', '/admin/create_outlet');
        
        const response = await fetch('/api/proxy', {
          method: 'POST',
          headers: getAuthHeaders('multipart/form-data'), // Use multipart headers
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
      } else {
        // If it's regular JSON data
        const response = await fetch('/api/proxy', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            endpoint: '/admin/create_outlet',
            data: formData
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create outlet');
        }

        const data = await response.json();
        if (data.detail?.includes('Error with token')) {
          throw new Error('Authentication error: ' + data.detail);
        }
        return data;
      }
    } catch (error) {
      console.error('Error creating outlet:', error);
      throw error;
    }
  },

  /**
   * Update an existing outlet
   * @param {Object|FormData} outletData - Outlet data with ID
   * @returns {Promise<Object>} - Response data
   */
  updateOutlet: async (outletData) => {
    try {
      // Check if outletData is a FormData instance
      if (outletData instanceof FormData) {
        // If it's FormData, we need to convert to regular object and send as JSON
        const formObject = {};
        outletData.forEach((value, key) => {
          // Skip image for now
          if (key !== 'image') {
            formObject[key] = value;
          }
        });
        
        const response = await fetch('/api/proxy', {
          method: 'POST', // Use POST for the proxy
          headers: getAuthHeaders(),
          body: JSON.stringify({
            endpoint: '/common/update_outlet',
            method: 'PATCH', // Tell the proxy to use PATCH for the actual API call
            data: formObject
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
      } else {
        // If it's regular JSON data
        const response = await fetch('/api/proxy', {
          method: 'POST', // Use POST for the proxy
          headers: getAuthHeaders(),
          body: JSON.stringify({
            endpoint: '/common/update_outlet',
            method: 'PATCH', // Tell the proxy to use PATCH for the actual API call
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
      }
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
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: '/common/listview_outlet',
          data: {
            user_id: parseInt(userId)
          }
        }),
      });
      
      const data = await response.json();
      if (data.detail?.includes('Error with token')) {
        throw new Error('Authentication error: ' + data.detail);
      }
      
      // Return the data array if it exists, otherwise return the raw response
      return data.data || data;
    } catch (error) {
      console.error('Error fetching outlets:', error);
      throw error;
    }
  },

  // View outlet details
  viewOutlet: async (outletId, userId) => {
    try {
      const userData = tokenService.getUserData();
      const userIdToUse =  2;
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          endpoint: '/common/view_outlet',
          data: {
            outlet_id: parseInt(outletId),
            user_id: parseInt(userIdToUse)
          }
        }),
      });

      const data = await response.json();
      if (data.detail?.includes('Error with token')) {
        throw new Error('Authentication error: ' + data.detail);
      }
      
      // Return the data object if it exists, otherwise return the raw response
      return data.data || data;
    } catch (error) {
      console.error('Error fetching outlet details:', error);
      throw error;
    }
  },
};

export default outletService; 