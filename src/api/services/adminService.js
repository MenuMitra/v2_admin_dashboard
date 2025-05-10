/**
 * Admin service for handling admin-specific API endpoints
 */
import { ENDPOINTS } from '../config';

const adminService = {
  /**
   * Get dashboard stats
   * @returns {Promise<Object>} - Response with dashboard statistics
   */
  getDashboard: () => {
    return fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `/admin${ENDPOINTS.ADMIN.DASHBOARD}`,
        data: {}
      }),
    }).then(response => response.json());
  },

  /**
   * Get all outlets
   * @returns {Promise<Object>} - Response with outlets data
   */
  getOutlets: () => {
    return fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `/admin${ENDPOINTS.ADMIN.OUTLETS}`,
        data: {}
      }),
    }).then(response => response.json());
  },

  /**
   * Get outlet details
   * @param {number} outletId - ID of the outlet
   * @returns {Promise<Object>} - Response with outlet details
   */
  getOutletDetails: (outletId) => {
    return fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `/admin${ENDPOINTS.ADMIN.OUTLET_DETAILS}`,
        data: { outlet_id: outletId }
      }),
    }).then(response => response.json());
  }
};

export default adminService; 