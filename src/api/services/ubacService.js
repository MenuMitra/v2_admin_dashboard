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

  deleteRole: async (roleId) => {
    try {
      const headers = getAuthHeaders();
      
      console.log('Deleting role with ID:', roleId);
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/delete_ubac_role/${roleId}`,
          method: 'DELETE',
          data: { role_id: roleId }
        }),
      });
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({
          detail: `HTTP error! Status: ${response.status}`
        }));
        console.error('Delete role failed:', errorResponse);
        return { error: true, detail: errorResponse.detail || 'Failed to delete role' };
      }
      
      const result = await response.json().catch(() => ({
        error: true,
        detail: 'Invalid response format'
      }));
      
      console.log('Delete role response:', result);
      
      return result;
    } catch (error) {
      console.error('Error deleting UBAC role:', error);
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
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/get_ubac_functionalities`,
          method: 'GET'
          // No data for GET requests
        }),
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
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/view_ubac_functionality/${functionalityId}`,
          data: {}
        }),
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
      
      console.log('Deleting functionality with ID:', functionalityId);
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/delete_ubac_functionality/${functionalityId}`,
          method: 'DELETE',
          data: { functionality_id: functionalityId }
        }),
      });
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({
          detail: `HTTP error! Status: ${response.status}`
        }));
        console.error('Delete functionality failed:', errorResponse);
        return { error: true, detail: errorResponse.detail || 'Failed to delete functionality' };
      }
      
      const result = await response.json().catch(() => ({
        error: true,
        detail: 'Invalid response format'
      }));
      
      console.log('Delete functionality response:', result);
      
      return result;
    } catch (error) {
      console.error('Error deleting UBAC functionality:', error);
      throw error;
    }
  },

  // Role-Functionality mapping
  createRoleFunctionalityMapping: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      // Format data according to API requirements
      const apiData = {
        functionality_id: data.functionality_id,
        role_id: data.role_id
      };
      
      // Validate required fields
      if (!apiData.role_id) {
        console.error('Role id is required for mapping creation');
        throw new Error('Role id is required');
      }
      
      if (!apiData.functionality_id) {
        console.error('Functionality id is required for mapping creation');
        throw new Error('Functionality id is required');
      }
      
      console.log('Creating role-functionality mapping with data:', apiData);
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/create_ubac_role_functionality_mapping`,
          data: apiData
        }),
      });
      
      const result = await response.json();
      console.log('Create mapping response:', result);
      
      return result;
    } catch (error) {
      console.error('Error creating role-functionality mapping:', error);
      throw error;
    }
  },

  updateRoleFunctionalityMapping: async (data) => {
    try {
      const headers = getAuthHeaders();
      
      // Format data according to API requirements
      const apiData = {
        role_functionality_mapping_id: data.role_functionality_mapping_id,
        functionality_id: data.functionality_id,
        role_id: data.role_id
      };
      
      console.log('Updating role-functionality mapping with data:', apiData);
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/update_ubac_role_functionality_mapping`,
          method: 'PUT',
          data: apiData
        }),
      });
      
      const result = await response.json();
      console.log('Update mapping response:', result);
      
      return result;
    } catch (error) {
      console.error('Error updating role-functionality mapping:', error);
      throw error;
    }
  },

  deleteRoleFunctionalityMapping: async (mappingId) => {
    try {
      const headers = getAuthHeaders();
      
      console.log('Deleting role-functionality mapping with ID:', mappingId);
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/delete_ubac_role_functionality_mapping/${mappingId}`,
          method: 'DELETE',
          data: { role_functionality_mapping_id: mappingId }
        }),
      });
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({
          detail: `HTTP error! Status: ${response.status}`
        }));
        console.error('Delete mapping failed:', errorResponse);
        return { error: true, detail: errorResponse.detail || 'Failed to delete mapping' };
      }
      
      const result = await response.json().catch(() => ({
        error: true,
        detail: 'Invalid response format'
      }));
      
      console.log('Delete mapping response:', result);
      
      return result;
    } catch (error) {
      console.error('Error deleting role-functionality mapping:', error);
      throw error;
    }
  },

  viewRoleFunctionalityMapping: async (mappingId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/view_ubac_role_functionality_mapping/${mappingId}`,
          data: {}
        }),
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
      
      console.log('Fetching all role-functionality mappings');
      
      // For GET requests, use the proxy endpoint directly with method parameter
      // but do not include a body
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/get_ubac_role_functionality_mappings`,
          method: 'GET'
          // No data property for GET requests
        }),
      });
      
      const result = await response.json();
      console.log('Get all mappings response:', result);
      
      return result;
    } catch (error) {
      console.error('Error fetching role-functionality mappings:', error);
      throw error;
    }
  },

  listviewRoleFunctionalityMapping: async (roleId) => {
    try {
      if (!roleId) {
        throw new Error('Role id is required');
      }
      
      const headers = getAuthHeaders();
      console.log('Fetching role functionality mappings with roleId:', roleId);
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin/listview_ubac_role_functionality_mapping`,
          method: 'POST',
          data: { role_id: roleId }
        }),
      });
      
      const result = await response.json();
      console.log('Role functionality mappings response:', result);
      
      return result;
    } catch (error) {
      console.error('Error fetching role functionality mappings:', error);
      throw error;
    }
  }
};

export default ubacService; 