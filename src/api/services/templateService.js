/**
 * Template service for handling QR template-related API calls
 */
import { ENDPOINTS, API_URL } from '../config';
import { getAuthHeaders, getAuthToken } from '@/utils/apiUtils';

const templateService = {
  /**
   * Get all QR templates
   * @returns {Promise<Array>} - Array of QR templates
   */
  getTemplates: async () => {
    try {
      const headers = getAuthHeaders();
      const endpoint = `/admin${ENDPOINTS.ADMIN.GET_QR_TEMPLATES}`;
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
        method: 'GET',
        headers,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching QR templates:', error);
      throw error;
    }
  },

  /**
   * Create a new QR template
   * @param {Object} data - Template data
   * @param {string} data.name - Template name
   * @param {string} data.qr_overlay_position - Position of QR overlay
   * @param {File} data.image - Template image file
   * @returns {Promise<Object>} - Created template data
   */
  createTemplate: async (data) => {
    try {
      console.log("Creating template with data:", {
        name: data.name,
        qr_overlay_position: data.qr_overlay_position,
        image_filename: data.image?.name
      });
      
      // Create FormData to send directly through proxy
      const formData = new FormData();
      formData.append('endpoint', `/admin${ENDPOINTS.ADMIN.CREATE_QR_TEMPLATE}`);
      formData.append('method', 'POST');
      
      // Add template data
      formData.append('name', data.name);
      formData.append('qr_overlay_position', data.qr_overlay_position);
      formData.append('image', data.image);
      
      // Add auth token to FormData request
      const token = getAuthToken();
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Send the FormData directly through our proxy
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: formData
      });
      
      const result = await response.json();
      console.log("Create template API response:", result);
      return result;
    } catch (error) {
      console.error('Error creating QR template:', error);
      throw error;
    }
  },

  /**
   * View a specific QR template
   * @param {number} templateId - ID of the template to view
   * @returns {Promise<Object>} - Template details
   */
  viewTemplate: async (templateId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin${ENDPOINTS.ADMIN.VIEW_QR_TEMPLATE}`,
          data: { template_id: templateId }
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error viewing QR template:', error);
      throw error;
    }
  },

  /**
   * Update a QR template
   * @param {Object} data - Template data to update
   * @param {string} data.name - Template name
   * @param {string} data.qr_overlay_position - Position of QR overlay
   * @param {number} data.template_id - ID of the template to update
   * @param {File} [data.image] - New template image file (optional)
   * @returns {Promise<Object>} - Updated template data
   */
  updateTemplate: async (data) => {
    try {
      console.log("Updating template with data:", data);
      const templateId = parseInt(data.template_id, 10);
      
      // Create FormData to send directly through proxy
      const formData = new FormData();
      formData.append('endpoint', `/admin${ENDPOINTS.ADMIN.UPDATE_QR_TEMPLATE}`);
      formData.append('method', 'PATCH');
      
      // Add template data
      formData.append('name', data.name);
      formData.append('qr_overlay_position', data.qr_overlay_position);
      formData.append('template_id', templateId);
      
      // Add image if provided
      if (data.image) {
        console.log("Image file included in update:", data.image.name);
        formData.append('image', data.image);
      }
      
      // Add auth token to FormData request
      const token = getAuthToken();
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Send the FormData directly through our proxy
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: formData
      });
      
      const result = await response.json();
      console.log("Update template API response:", result);
      return result;
    } catch (error) {
      console.error('Error updating QR template:', error);
      throw error;
    }
  },

  /**
   * Delete a QR template
   * @param {number} templateId - ID of the template to delete
   * @returns {Promise<Object>} - Response indicating success
   */
  deleteTemplate: async (templateId) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: `/admin${ENDPOINTS.ADMIN.DELETE_QR_TEMPLATE}/${templateId}`,
          method: 'DELETE',
          data: {}
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting QR template:', error);
      throw error;
    }
  },

  /**
   * Get the complete URL for a template image
   * @param {string} imageName - The filename of the image
   * @returns {string} - Complete image URL
   */
  getTemplateImageUrl: (imageName) => {
    if (!imageName) return null;
    
    // Check if an absolute URL was already provided
    if (imageName.startsWith('http')) {
      return imageName;
    }
    
    // Use the most likely URL path based on API analysis
    return `https://men4u.xyz/v2/uploads/qr_code_templates/${imageName}`;
  },
};

export default templateService; 