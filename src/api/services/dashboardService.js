import { getAuthHeaders, makeApiRequest } from '@/utils/apiUtils';
import { ENDPOINTS } from '@/api/config';

/**
 * Dashboard Service - Handles all API calls related to dashboard data
 */
const dashboardService = {
  /**
   * Get admin home dashboard data
   * @returns {Promise<Object>} - Response data containing outlet data and counts
   */
  getAdminHomeData: async () => {
    try {
      // Use the makeApiRequest utility for consistency with other services
      return await makeApiRequest({
        endpoint: `/admin${ENDPOINTS.ADMIN.ADMIN_HOME}`,
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching admin home data:', error);
      throw error;
    }
  }
};

export default dashboardService; 