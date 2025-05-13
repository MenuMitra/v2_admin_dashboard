import { makeApiRequest } from '@/utils/apiUtils';

const ownerService = {
  // Create a new owner
  createOwner: async (data) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/create_owner`,
        method: 'POST',
        data
      });
    } catch (error) {
      console.error('Error creating owner:', error);
      throw error;
    }
  },

  // Get list of owners
  listOwners: async (userId) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/listview_owner/${userId}`,
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching owners:', error);
      throw error;
    }
  },

  // View owner details
  viewOwner: async (ownerId) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/view_owner`,
        method: 'POST',
        data: {
          user_id: parseInt(ownerId),
          owner_id: parseInt(ownerId)
        }
      });
    } catch (error) {
      console.error('Error viewing owner:', error);
      throw error;
    }
  },

  // Update owner
  updateOwner: async (data) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/update_owner`,
        method: 'PATCH',
        data
      });
    } catch (error) {
      console.error('Error updating owner:', error);
      throw error;
    }
  },

  // Delete owner
  deleteOwner: async (ownerId, userId) => {
    try {
      return await makeApiRequest({
        endpoint: `/admin/delete_owner`,
        method: 'DELETE',
        data: {
          owner_id: parseInt(ownerId),
          user_id: parseInt(userId)
        }
      });
    } catch (error) {
      console.error('Error deleting owner:', error);
      throw error;
    }
  },
};

export default ownerService; 