import { commonApiClient } from '../client';
import { API_ENDPOINTS, ENDPOINTS } from '../config';
import { getAuthHeaders } from '@/utils/apiUtils';

/**
 * Common Service - Handles all API calls related to common endpoints
 */
const commonService = {
  /**
   * Get menu data
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Response data containing menu
   */
  getMenu: (params = {}) => {
    return commonApiClient.get(API_ENDPOINTS.COMMON.MENU, { params });
  },

  /**
   * Get all categories
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Response data containing categories
   */
  getCategories: (params = {}) => {
    return commonApiClient.get(API_ENDPOINTS.COMMON.CATEGORIES, { params });
  },

  /**
   * Get items
   * @param {Object} params - Query parameters
   * @param {number} params.categoryId - Optional category ID to filter items
   * @returns {Promise<Object>} - Response data containing items
   */
  getItems: (params = {}) => {
    return commonApiClient.get(API_ENDPOINTS.COMMON.ITEMS, { params });
  },
  
  /**
   * Create a new category
   * @param {Object} data - Category data
   * @returns {Promise<Object>} - Response data
   */
  createCategory: (data) => {
    return commonApiClient.post(API_ENDPOINTS.COMMON.CATEGORIES, data);
  },
  
  /**
   * Update a category
   * @param {number} categoryId - ID of the category
   * @param {Object} data - Category data to update
   * @returns {Promise<Object>} - Response data
   */
  updateCategory: (categoryId, data) => {
    return commonApiClient.patch(`${API_ENDPOINTS.COMMON.CATEGORIES}/${categoryId}`, data);
  },
  
  /**
   * Delete a category
   * @param {number} categoryId - ID of the category to delete
   * @returns {Promise<Object>} - Response data
   */
  deleteCategory: (categoryId) => {
    return commonApiClient.delete(`${API_ENDPOINTS.COMMON.CATEGORIES}/${categoryId}`);
  },
  
  /**
   * Create a new item
   * @param {Object} data - Item data
   * @returns {Promise<Object>} - Response data
   */
  createItem: (data) => {
    return commonApiClient.post(API_ENDPOINTS.COMMON.ITEMS, data);
  },
  
  /**
   * Update an item
   * @param {number} itemId - ID of the item
   * @param {Object} data - Item data to update
   * @returns {Promise<Object>} - Response data
   */
  updateItem: (itemId, data) => {
    return commonApiClient.patch(`${API_ENDPOINTS.COMMON.ITEMS}/${itemId}`, data);
  },
  
  /**
   * Delete an item
   * @param {number} itemId - ID of the item to delete
   * @returns {Promise<Object>} - Response data
   */
  deleteItem: (itemId) => {
    return commonApiClient.delete(`${API_ENDPOINTS.COMMON.ITEMS}/${itemId}`);
  },

  /**
   * Get outlet types
   * @returns {Promise<Object>} - Response data containing outlet types
   */
  getOutletTypes: async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/proxy?endpoint=/common${ENDPOINTS.COMMON.GET_OUTLET_TYPES}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch outlet types');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching outlet types:', error);
      throw error;
    }
  },

  /**
   * Get food types
   * @returns {Promise<Object>} - Response data containing food types
   */
  getFoodTypes: async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/proxy?endpoint=/common${ENDPOINTS.COMMON.GET_FOOD_TYPES}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch food types');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching food types:', error);
      throw error;
    }
  }
};

export default commonService; 