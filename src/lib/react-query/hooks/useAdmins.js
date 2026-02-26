import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_CONFIG } from '../../../config/appConfig';
import { queryKeys } from '../queryKeys';

const { BASE_URL, API_VERSION } = API_CONFIG;

export function useAdmins(token) {
  const queryClient = useQueryClient();

  // List admins query
  const adminsQuery = useQuery({
    queryKey: queryKeys.admins.list(),
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/admin/list_admins`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data;
    },
    enabled: !!token, // Only run if token exists
  });

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async ({ adminId, userId }) => {
      const response = await axios.post(
        `${BASE_URL}/admin/delete_admin`,
        {
          admin_id: adminId,
          user_id: userId,
          app_source: "admin",
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
      // Invalidate and refetch admins list after successful deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.list() });
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ userIds, action }) => {
      const response = await axios.post(
        `${BASE_URL}/common/bulk_admin_action`,
        {
          user_ids: userIds,
          action: action,
          app_source: "admin_app",
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
      // Invalidate and refetch admins list after successful bulk action
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.list() });
    },
  });

  // Update admin mutation
  const updateAdminMutation = useMutation({
    mutationFn: async (adminData) => {
      const response = await axios.patch(
        `${BASE_URL}/admin/update_admin`,
        adminData,
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
      // Invalidate and refetch admins list after successful update
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.list() });
    },
  });

  return {
    admins: adminsQuery.data ?? [],
    isLoading: adminsQuery.isLoading,
    error: adminsQuery.error,
    deleteAdmin: deleteAdminMutation.mutate,
    isDeleting: deleteAdminMutation.isLoading,
    deleteError: deleteAdminMutation.error,
    bulkAction: bulkActionMutation.mutate,
    isBulkActioning: bulkActionMutation.isLoading,
    bulkActionError: bulkActionMutation.error,
    updateAdmin: updateAdminMutation.mutate,
    isUpdating: updateAdminMutation.isLoading,
    updateError: updateAdminMutation.error,
    refetch: adminsQuery.refetch,
  };
} 