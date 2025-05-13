import { makeApiRequest } from '@/utils/apiUtils';
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
    return makeApiRequest({
      endpoint: '/common/listview_outlet',
      method: 'POST',
      data: {
        ...params
      }
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
    return makeApiRequest({
      endpoint: '/common/view_outlet',
      method: 'POST',
      data: {
        outlet_id: outletId
      }
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
        return await makeApiRequest({
          endpoint: '/admin/create_outlet',
          method: 'POST',
          data: formData,
          useFormData: true
        });
      } else {
        // If it's regular JSON data
        return await makeApiRequest({
          endpoint: '/admin/create_outlet',
          method: 'POST',
          data: formData
        });
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
        
        return await makeApiRequest({
          endpoint: '/common/update_outlet',
          method: 'PATCH',
          data: formObject
        });
      } else {
        // If it's regular JSON data
        return await makeApiRequest({
          endpoint: '/common/update_outlet',
          method: 'PATCH',
          data: outletData
        });
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
    return makeApiRequest({
      endpoint: '/common/delete_outlet',
      method: 'POST',
      data: {
        outlet_id: outletId
      }
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
      const data = await makeApiRequest({
        endpoint: '/common/listview_outlet',
        method: 'POST',
        data: {
          user_id: parseInt(userId)
        }
      });
      
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
      const userIdToUse = 2;
      
      const data = await makeApiRequest({
        endpoint: '/common/view_outlet',
        method: 'POST',
        data: {
          outlet_id: parseInt(outletId),
          user_id: parseInt(userIdToUse)
        }
      });
      
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