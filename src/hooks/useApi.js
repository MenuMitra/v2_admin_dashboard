import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for making API requests with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {boolean} callOnMount - Whether to call the API on component mount
 * @param {any} initialData - Initial data state
 * @returns {Object} - Loading state, error state, data, and execute function
 */
const useApi = (apiFunction, dependencies = [], callOnMount = true, initialData = null) => {
  const [loading, setLoading] = useState(callOnMount);
  const [error, setError] = useState(null);
  const [data, setData] = useState(initialData);

  /**
   * Execute the API request with optional parameters
   * @param {any} params - Parameters to pass to the API function
   * @returns {Promise<any>} - The API response data
   */
  const execute = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(params);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data || { message: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  // Call the API on mount if specified
  useEffect(() => {
    if (callOnMount) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  return { loading, error, data, execute };
};

export default useApi; 