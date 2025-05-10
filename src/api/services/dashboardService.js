import { getAuthHeaders } from '@/utils/apiUtils';
import { ENDPOINTS } from '@/api/config';

/**
 * Dashboard Service - Handles all API calls related to dashboard data
 */
const dashboardService = {
  /**
   * Get dashboard statistics (revenue, orders, outlets, footfall)
   * @returns {Promise<Object>} - Response data containing dashboard stats
   */
  getStats: async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: '/admin/dashboard_stats',
          data: {}
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get top performing outlets
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of outlets to return
   * @returns {Promise<Object>} - Response data containing top outlets
   */
  getTopOutlets: (params = { limit: 5 }) => {
    return apiClient.get(API_ENDPOINTS.DASHBOARD.TOP_OUTLETS, { params });
  },

  /**
   * Get recent orders
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of orders to return
   * @returns {Promise<Object>} - Response data containing recent orders
   */
  getRecentOrders: (params = { limit: 5 }) => {
    return apiClient.get(API_ENDPOINTS.DASHBOARD.RECENT_ORDERS, { params });
  },

  /**
   * Get alert notifications
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of alerts to return
   * @returns {Promise<Object>} - Response data containing alerts
   */
  getAlerts: (params = { limit: 4 }) => {
    return apiClient.get(API_ENDPOINTS.DASHBOARD.ALERTS, { params });
  },

  /**
   * Get order distribution by outlet
   * @param {Object} params - Query parameters
   * @param {string} params.timeRange - Time range (today, week, month)
   * @returns {Promise<Object>} - Response data containing order distribution
   */
  getOrderDistribution: (params = { timeRange: 'today' }) => {
    return apiClient.get(API_ENDPOINTS.DASHBOARD.ORDER_DISTRIBUTION, { params });
  },

  /**
   * Get all dashboard data in a single request
   * @returns {Promise<Object>} - All dashboard data
   */
  getAllDashboardData: async () => {
    try {
      const [stats, topOutlets, recentOrders, alerts, orderDistribution] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTopOutlets(),
        dashboardService.getRecentOrders(),
        dashboardService.getAlerts(),
        dashboardService.getOrderDistribution(),
      ]);

      return {
        stats: stats.data,
        topOutlets: topOutlets.data,
        recentOrders: recentOrders.data,
        alerts: alerts.data,
        orderDistribution: orderDistribution.data,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: '/admin/recent_activities',
          data: {}
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Get revenue data
  getRevenueData: async (timeRange = '6months') => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          endpoint: '/admin/revenue_data',
          data: { time_range: timeRange }
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  }
};

export default dashboardService; 