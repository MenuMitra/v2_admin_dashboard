/**
 * UBAC (User-Based Access Control) service for handling role and functionality related API calls
 */
import { ENDPOINTS } from '../config';
import { makeApiRequest } from '@/utils/apiUtils';

const ubacService = {
  // Role management
  createRole: async (data) => {
    try {
      return makeApiRequest({
        endpoint: `/admin/create_ubac_role`,
        method: 'POST',
        data
      });
    } catch (error) {
      console.error('Error creating UBAC role:', error);
      throw error;
    }
  },

  deleteRole: async (roleId) => {
    try {
      console.log('Deleting role with ID:', roleId);
      
      return makeApiRequest({
        endpoint: `/admin/delete_ubac_role/${roleId}`,
        method: 'DELETE',
        data: { role_id: roleId }
      });
    } catch (error) {
      console.error('Error deleting UBAC role:', error);
      throw error;
    }
  },

  // Functionality management
  createFunctionality: async (data) => {
    try {
      return makeApiRequest({
        endpoint: `/admin/create_ubac_functionality`,
        method: 'POST',
        data
      });
    } catch (error) {
      console.error('Error creating UBAC functionality:', error);
      throw error;
    }
  },

  getFunctionalities: async () => {
    try {
      return makeApiRequest({
        endpoint: `/admin/get_ubac_functionalities`,
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching UBAC functionalities:', error);
      throw error;
    }
  },

  viewFunctionality: async (functionalityId) => {
    try {
      return makeApiRequest({
        endpoint: `/admin/view_ubac_functionality/${functionalityId}`,
        method: 'GET'
      });
    } catch (error) {
      console.error('Error viewing UBAC functionality:', error);
      throw error;
    }
  },

  updateFunctionality: async (data) => {
    try {
      return makeApiRequest({
        endpoint: `/admin/update_ubac_functionality`,
        method: 'PUT',
        data
      });
    } catch (error) {
      console.error('Error updating UBAC functionality:', error);
      throw error;
    }
  },

  deleteFunctionality: async (functionalityId) => {
    try {
      console.log('Deleting functionality with ID:', functionalityId);
      
      return makeApiRequest({
        endpoint: `/admin/delete_ubac_functionality/${functionalityId}`,
        method: 'DELETE',
        data: { functionality_id: functionalityId }
      });
    } catch (error) {
      console.error('Error deleting UBAC functionality:', error);
      throw error;
    }
  },

  // Role-Functionality mapping
  createRoleFunctionalityMapping: async (data) => {
    try {
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
      
      return makeApiRequest({
        endpoint: `/admin/create_ubac_role_functionality_mapping`,
        method: 'POST',
        data: apiData
      });
    } catch (error) {
      console.error('Error creating role-functionality mapping:', error);
      throw error;
    }
  },

  updateRoleFunctionalityMapping: async (data) => {
    try {
      // Format data according to API requirements
      const apiData = {
        role_functionality_mapping_id: data.role_functionality_mapping_id,
        functionality_id: data.functionality_id,
        role_id: data.role_id
      };
      
      console.log('Updating role-functionality mapping with data:', apiData);
      
      return makeApiRequest({
        endpoint: `/admin/update_ubac_role_functionality_mapping`,
        method: 'PUT',
        data: apiData
      });
    } catch (error) {
      console.error('Error updating role-functionality mapping:', error);
      throw error;
    }
  },

  deleteRoleFunctionalityMapping: async (mappingId) => {
    try {
      console.log('Deleting role-functionality mapping with ID:', mappingId);
      
      return makeApiRequest({
        endpoint: `/admin/delete_ubac_role_functionality_mapping/${mappingId}`,
        method: 'DELETE',
        data: { role_functionality_mapping_id: mappingId }
      });
    } catch (error) {
      console.error('Error deleting role-functionality mapping:', error);
      throw error;
    }
  },

  viewRoleFunctionalityMapping: async (mappingId) => {
    try {
      return makeApiRequest({
        endpoint: `/admin/view_ubac_role_functionality_mapping/${mappingId}`,
        method: 'GET'
      });
    } catch (error) {
      console.error('Error viewing role-functionality mapping:', error);
      throw error;
    }
  },

  getRoleFunctionalityMappings: async () => {
    try {
      console.log('Fetching all role-functionality mappings');
      
      return makeApiRequest({
        endpoint: `/admin/get_ubac_role_functionality_mappings`,
        method: 'GET'
      });
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
      
      console.log('Fetching role functionality mappings with roleId:', roleId);
      
      return makeApiRequest({
        endpoint: `/admin/listview_ubac_role_functionality_mapping`,
        method: 'POST',
        data: { role_id: roleId }
      });
    } catch (error) {
      console.error('Error fetching role functionality mappings:', error);
      throw error;
    }
  }
};

export default ubacService; 