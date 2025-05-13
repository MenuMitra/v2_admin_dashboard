import { makeApiRequest } from '@/utils/apiUtils';

const partnerService = {
  // Create a new partner
  createPartner: async (data) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/create_partner`,
        method: 'POST',
        data
      });
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  },

  // Get list of partners
  listPartners: async (userId) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/listview_partner/${userId}`,
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  },

  // View partner details
  viewPartner: async (partnerId, userId) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/view_partner`,
        method: 'POST',
        data: {
          partner_id: parseInt(partnerId),
          user_id: parseInt(userId)
        }
      });
    } catch (error) {
      console.error('Error viewing partner:', error);
      throw error;
    }
  },

  // Update partner
  updatePartner: async (data) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/update_partner`,
        method: 'PATCH',
        data
      });
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  },

  // Delete partner
  deletePartner: async (partnerId, userId) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/delete_partner`,
        method: 'DELETE',
        data: {
          partner_id: parseInt(partnerId),
          user_id: parseInt(userId)
        }
      });
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw error;
    }
  },
};

export default partnerService; 