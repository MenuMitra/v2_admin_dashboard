import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { toastController } from '../../../utils/toastController';
import { queryKeys } from '../queryKeys';

export const useSuperOwners = () => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // Fetch super owners list
  const {
    data: superOwners = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.superOwners.list(),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/listview_super_owner',
        { app_source: 'admin_app' },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      // Normalize data to add user_id before returning
      return response.data?.super_owners?.map((owner) => ({
        ...owner,
        user_id: owner.super_owner_id,
      })) || [];
    },
  });

  // Fetch super owner details
  const useOwnerDetails = (superOwnerId) => {
    return useQuery({
      queryKey: queryKeys.superOwners.detail(superOwnerId),
      queryFn: async () => {
        const token = getToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await axios.post(
          'https://men4u.xyz/v2/admin/view_super_owner',
          {
            user_id: adminData?.user_id,
            super_owner_id: superOwnerId,
            app_source: 'admin_app'
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          }
        );

        return {
          superOwnerData: response.data.super_owner,
          assignedOutlets: response.data.assigned_outlets,
          assignedFunctionalities: response.data.assigned_functionalities,
          totalOutlets: response.data.total_outlets,
          totalFunctionalities: response.data.total_functionalities
        };
      },
      enabled: !!superOwnerId && !!adminData?.user_id,
    });
  };

  // Delete super owner mutation
  const deleteMutation = useMutation({
    mutationFn: async (superOwnerId) => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.delete('https://men4u.xyz/v2/admin/delete_super_owner', {
        data: {
          super_owner_id: superOwnerId,
          app_source: 'admin_app',
          user_id: adminData?.user_id
        },
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch super owners list
      queryClient.invalidateQueries({ queryKey: queryKeys.superOwners.list() });
      toastController.success('Super owner deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting super owner:', error);
      toastController.error('Failed to delete super owner');
    },
  });

  return {
    superOwners,
    isLoading,
    error,
    refetch,
    useOwnerDetails,
    deleteMutation,
  };
}; 