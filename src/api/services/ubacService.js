/**
 * UBAC (User-Based Access Control) service for handling role and functionality related API calls
 */
import { ENDPOINTS } from '../config';
import { getAuthHeaders, getAuthToken } from '@/utils/apiUtils';

const ubacService = {
  // Role management
  createRole: async (data) => {
    try {
      // Get auth token
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/create_ubac_role`,
          data
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating UBAC role:', error);
      throw error;
    }
  },

  getRoles: async () => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/get_ubac_roles`,
          data: {}
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching UBAC roles:', error);
      throw error;
    }
  },

  // Functionality management
  createFunctionality: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/create_ubac_functionality`,
          data
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating UBAC functionality:', error);
      throw error;
    }
  },

  getFunctionalities: async () => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent('/admin/get_ubac_functionalities')}`, {
        method: 'GET',
        headers,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching UBAC functionalities:', error);
      throw error;
    }
  },

  viewFunctionality: async (functionalityId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/admin/view_ubac_functionality/${functionalityId}`)}`, {
        method: 'GET',
        headers,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error viewing UBAC functionality:', error);
      throw error;
    }
  },

  updateFunctionality: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/update_ubac_functionality`,
          method: 'PUT',
          data
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating UBAC functionality:', error);
      throw error;
    }
  },

  deleteFunctionality: async (functionalityId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/delete_ubac_functionality/${functionalityId}`,
          method: 'DELETE',
          data: {}
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting UBAC functionality:', error);
      throw error;
    }
  },

  // Role-Functionality mapping
  createRoleFunctionalityMapping: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/create_ubac_role_functionality_mapping`,
          data
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating role-functionality mapping:', error);
      throw error;
    }
  },

  updateRoleFunctionalityMapping: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/update_ubac_role_functionality_mapping`,
          method: 'PUT',
          data
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating role-functionality mapping:', error);
      throw error;
    }
  },

  deleteRoleFunctionalityMapping: async (mappingId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/delete_ubac_role_functionality_mapping/${mappingId}`,
          method: 'DELETE',
          data: {}
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting role-functionality mapping:', error);
      throw error;
    }
  },

  viewRoleFunctionalityMapping: async (mappingId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/admin/view_ubac_role_functionality_mapping/${mappingId}`)}`, {
        method: 'GET',
        headers,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error viewing role-functionality mapping:', error);
      throw error;
    }
  },

  getRoleFunctionalityMappings: async () => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent('/admin/get_ubac_role_functionality_mappings')}`, {
        method: 'GET',
        headers,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching role-functionality mappings:', error);
      throw error;
    }
  },

  listviewRoleFunctionalityMapping: async (roleId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/listview_ubac_role_functionality_mapping`,
          data: { role_id: roleId }
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error listing role-functionality mappings:', error);
      throw error;
    }
  }
};

export default ubacService; 