import { getAuthHeaders } from '@/utils/apiUtils';
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
      const headers = getAuthHeaders();
      
      // Using URL parameter for GET requests to the proxy
      const apiUrl = `/api/proxy?endpoint=/admin${ENDPOINTS.ADMIN.ADMIN_HOME}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin home data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching admin home data:', error);
      throw error;
    }
  }
};

export default dashboardService; 