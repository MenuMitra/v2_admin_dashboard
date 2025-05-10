import { getAuthHeaders } from '@/utils/apiUtils';

const ownerService = {
  // Create a new owner
  createOwner: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/create_owner`,
          data
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating owner:', error);
      throw error;
    }
  },

  // Get list of owners
  listOwners: async (userId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/admin/listview_owner/${userId}`)}`, {
        method: 'GET',
        headers,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching owners:', error);
      throw error;
    }
  },

  // View owner details
  viewOwner: async (ownerId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/view_owner`,
          data: {
            user_id: parseInt(ownerId),
            owner_id: parseInt(ownerId)
          }
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error viewing owner:', error);
      throw error;
    }
  },

  // Update owner
  updateOwner: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/update_owner`,
          method: 'PATCH',
          data
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating owner:', error);
      throw error;
    }
  },

  // Delete owner
  deleteOwner: async (ownerId, userId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/delete_owner`,
          method: 'DELETE',
          data: {
            owner_id: parseInt(ownerId),
            user_id: parseInt(userId)
          }
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting owner:', error);
      throw error;
    }
  },
};

export default ownerService; 