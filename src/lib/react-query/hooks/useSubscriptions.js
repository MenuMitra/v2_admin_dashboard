import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { toastController } from '../../../utils/toastController';
import { queryKeys } from '../queryKeys';
import { API_CONFIG } from '../../../config/appConfig';

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useSubscriptions = () => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // List Query
  const {
    data: subscriptions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.subscriptions.list(),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${BASE_URL}/admin/list_subscriptions`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.detail === 'Subscription list fetched successfully') {
        return response.data.data;
      }
      return [];
    },
  });

  // Delete Subscription Mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId) => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.post(
        `${BASE_URL}/admin/delete_subscription`,
        {
          subscription_id: subscriptionId,
          user_id: adminData.user_id,
          app_source: 'admin_app',
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.subscriptions.list());
      toastController.success('Subscription deleted successfully!');
    },
    onError: (err) => {
      toastController.error(err.response?.data?.detail || 'Failed to delete subscription');
    },
  });

  return {
    subscriptions,
    isLoading,
    error,
    refetch,
    deleteSubscriptionMutation,
  };
}; 