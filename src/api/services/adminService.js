/**
 * Admin service for handling admin-specific API endpoints
 */
import { ENDPOINTS } from '../config';
import { makeApiRequest } from '@/utils/apiUtils';

const adminService = {
  /**
   * Get dashboard stats
   * @returns {Promise<Object>} - Response with dashboard statistics
   */
  getDashboard: () => {
    return makeApiRequest({
      endpoint: `/admin${ENDPOINTS.ADMIN.DASHBOARD}`,
      method: 'POST',
      data: {}
    });
  },

  /**
   * Get all outlets
   * @returns {Promise<Object>} - Response with outlets data
   */
  getOutlets: () => {
    return makeApiRequest({
      endpoint: `/admin${ENDPOINTS.ADMIN.OUTLETS}`,
      method: 'POST',
      data: {}
    });
  },

  /**
   * Get outlet details
   * @param {number} outletId - ID of the outlet
   * @returns {Promise<Object>} - Response with outlet details
   */
  getOutletDetails: (outletId) => {
    return makeApiRequest({
      endpoint: `/admin${ENDPOINTS.ADMIN.OUTLET_DETAILS}`,
      method: 'POST',
      data: { outlet_id: outletId }
    });
  }
};

export default adminService; 