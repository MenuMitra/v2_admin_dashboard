import { getAuthHeaders } from '@/utils/apiUtils';
import { ENDPOINTS } from '@/api/config';

const partnerService = {
  // Create a new partner
  createPartner: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: ENDPOINTS.ADMIN.CREATE_PARTNER,
          data
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  },

  // Get list of partners
  listPartners: async (userId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`${ENDPOINTS.ADMIN.LISTVIEW_PARTNER}/${userId}`)}`, {
        method: 'GET',
        headers,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  },

  // View partner details
  viewPartner: async (partnerId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`${ENDPOINTS.ADMIN.VIEW_PARTNER}/${partnerId}`)}`, {
        method: 'GET',
        headers,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error viewing partner:', error);
      throw error;
    }
  },

  // Update partner
  updatePartner: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: ENDPOINTS.ADMIN.UPDATE_PARTNER,
          method: 'PATCH',
          data
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  },

  // Delete partner
  deletePartner: async (partnerId, userId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: ENDPOINTS.ADMIN.DELETE_PARTNER,
          data: {
            partner_id: partnerId,
            user_id: userId
          }
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw error;
    }
  },
};

export default partnerService; 