import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { API_CONFIG } from '../../../config/appConfig';
import { queryKeys } from '../queryKeys';
import { toastController } from '../../../utils/toastController';

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useRoles = () => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // List Query
  const {
    data: roles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/get_list/roles`,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
  });

  // Create Role Mutation
  const createMutation = useMutation({
    mutationFn: async (roleName) => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/create_ubac_role`,
        {
          role_name: roleName,
          user_id: adminData.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.roles.list());
      toastController.success("Role created successfully!");
    },
    onError: (error) => {
      toastController.error(error.response?.data?.message || "Failed to create role");
    },
  });

  // Update Role Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ roleId, roleName }) => {
      const response = await axios.put(
        `${BASE_URL}/${API_VERSION}/admin/update_ubac_role`,
        {
          role_id: roleId,
          role_name: roleName,
          user_id: adminData.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.roles.list());
      toastController.success("Role updated successfully!");
    },
    onError: (error) => {
      toastController.error(error.response?.data?.message || "Failed to update role");
    },
  });

  // Delete Role Mutation
  const deleteMutation = useMutation({
    mutationFn: async (roleId) => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/delete_ubac_role`,
        {
          role_id: roleId,
          user_id: adminData.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.roles.list());
      toastController.success("Role deleted successfully!");
    },
    onError: (error) => {
      toastController.error(error.response?.data?.message || "Failed to delete role");
    },
  });

  return {
    roles,
    isLoading,
    error,
    createRole: createMutation.mutate,
    isCreating: createMutation.isLoading,
    updateRole: updateMutation.mutate,
    isUpdating: updateMutation.isLoading,
    deleteRole: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
    refetchRoles: () => queryClient.invalidateQueries(queryKeys.roles.list()),
  };
}; 