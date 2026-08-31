import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { queryKeys } from '../queryKeys';
import { API_CONFIG } from '../../../config/appConfig';
import { toastController } from '../../../utils/toastController';

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useCustomers = (statusFilter = 'all') => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // List Query
  const {
    data: customers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.customers.list(), statusFilter],
    queryFn: async () => {
      const requestData = {
        user_id: adminData?.user_id,
        app_source: "admin_app",
      };

      if (statusFilter !== 'all') {
        requestData.is_active = statusFilter === 'active' ? 1 : 0;
      }

      const response = await axios.post(
        `${BASE_URL}/admin/customer_listview`,
        requestData,
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      return response.data.customers || [];
    },
    enabled: !!adminData?.user_id,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (customer_id) => {
      await axios.delete(`${BASE_URL}/admin/customer_delete`, {
        headers: {
          Authorization: getToken(),
        },
        data: {
          user_id: adminData?.user_id,
          customer_id,
          app_source: "admin_app",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toastController.success('Customer deleted successfully');
    },
    onError: (error) => {
      toastController.error(error.response?.data?.msg || 'Failed to delete customer');
    },
  });

  // Update Customer Mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      const response = await axios.patch(
        `${BASE_URL}/admin/customer_update`,
        customerData,
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });

  // Bulk Action Mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, customerIds }) => {
      await axios.post(
        `${BASE_URL}/common/bulk_customer_action`,
        {
          user_id: adminData.user_id,
          action,
          app_source: "admin_app",
          customer_ids: customerIds,
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toastController.success('Bulk action completed successfully');
    },
    onError: (error) => {
      toastController.error(error.response?.data?.detail || 'Failed to perform bulk action');
    },
  });

  return {
    customers,
    isLoading,
    error,
    refetch,
    deleteCustomer: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    updateCustomer: updateCustomerMutation.mutate,
    isUpdating: updateCustomerMutation.isPending,
    bulkAction: bulkActionMutation.mutate,
    isBulkActioning: bulkActionMutation.isPending,
  };
}; 