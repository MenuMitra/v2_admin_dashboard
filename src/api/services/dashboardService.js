import { getAuthHeaders } from '@/utils/apiUtils';
import { ENDPOINTS, API_URL } from '@/api/config';
import { isStaticExport } from '@/utils/staticConfig';

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
      const endpoint = `/admin${ENDPOINTS.ADMIN.ADMIN_HOME}`;
      
      // For static exports, make direct API calls
      if (isStaticExport) {
        const directUrl = `${API_URL}${endpoint}`;
        const response = await fetch(directUrl, {
          method: 'GET',
          headers,
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch admin home data');
        }
        
        return await response.json();
      }
      
      // Using URL parameter for GET requests to the proxy
      const apiUrl = `/api/proxy?endpoint=${encodeURIComponent(endpoint)}`;
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