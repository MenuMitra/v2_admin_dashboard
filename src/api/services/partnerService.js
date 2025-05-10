import { getAuthHeaders } from '@/utils/apiUtils';

const partnerService = {
  // Create a new partner
  createPartner: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/create_partner`,
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
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/admin/listview_partner/${userId}`)}`, {
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
  viewPartner: async (partnerId, userId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/view_partner`,
          data: {
            partner_id: parseInt(partnerId),
            user_id: parseInt(userId)
          }
        }),
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
          endpoint: `/admin/update_partner`,
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
          endpoint: `/admin/delete_partner`,
          method: 'DELETE',
          data: {
            partner_id: parseInt(partnerId),
            user_id: parseInt(userId)
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