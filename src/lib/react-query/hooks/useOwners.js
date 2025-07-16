import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_CONFIG } from '../../../config/appConfig';
import { queryKeys } from '../queryKeys';
import { toastController } from '../../../utils/toastController';

const { BASE_URL, API_VERSION } = API_CONFIG;

export function useOwners(token, userId) {
  const queryClient = useQueryClient();

  // List owners query
  const ownersQuery = useQuery({
    queryKey: queryKeys.owners.list(),
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/listview_owner/${userId}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    enabled: !!token && !!userId, // Only run if token and userId exist
  });

  // Delete owner mutation
  const deleteOwnerMutation = useMutation({
    mutationFn: async ({ ownerId, userId }) => {
      const response = await axios.delete(
        `${BASE_URL}/${API_VERSION}/common/delete_owner`,
        {
          data: {
            owner_id: ownerId,
            user_id: userId,
          },
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch owners list after successful deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.list() });
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ userIds, action, userId }) => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/bulk_owner_action`,
        {
          user_id: userId,
          action: action,
          app_source: "admin_app",
          owner_ids: userIds
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch owners list after successful bulk action
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.list() });
    },
  });

  return {
    owners: ownersQuery.data ?? [],
    isLoading: ownersQuery.isLoading,
    error: ownersQuery.error,
    deleteOwner: deleteOwnerMutation.mutate,
    isDeleting: deleteOwnerMutation.isLoading,
    deleteError: deleteOwnerMutation.error,
    bulkAction: bulkActionMutation.mutate,
    isBulkActioning: bulkActionMutation.isLoading,
    bulkActionError: bulkActionMutation.error,
    refetch: ownersQuery.refetch,
  };
} 