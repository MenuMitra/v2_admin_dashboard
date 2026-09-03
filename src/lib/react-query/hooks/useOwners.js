import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";
import { API_CONFIG } from "../../../config/appConfig";

const { BASE_URL } = API_CONFIG;

export const useOwners = (filters = {}) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const {
    filter = "all",
    company_id = null,
    page = 1,
    page_size = 200,
  } = filters;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.owners.list({ filter, company_id, page, page_size }),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const payload = {
        user_id: adminData.user_id,
        app_source: "admin",
        filter,
        page,
        page_size,
      };
      if (company_id) payload.company_id = Number(company_id);

      const response = await axios.post(
        `${BASE_URL}/admin/list_owners`,
        payload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        owners: response.data?.owners || [],
        total_owners: response.data?.total_owners ?? 0,
        page: response.data?.page ?? page,
        page_size: response.data?.page_size ?? page_size,
      };
    },
    enabled: !!adminData?.user_id,
  });

  const owners = data?.owners || [];

  const deleteMutation = useMutation({
    mutationFn: async (ownerId) => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      await axios.delete(`${BASE_URL}/admin/delete_owner`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: {
          user_id: adminData.user_id,
          app_source: "admin",
          owner_id: Number(ownerId),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all });
      toastController.success("Owner deleted successfully");
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete owner"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.patch(
        `${BASE_URL}/admin/update_owner`,
        {
          user_id: adminData.user_id,
          app_source: "admin",
          ...payload,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all });
    },
  });

  const counts = {
    total: data?.total_owners ?? owners.length,
    active: owners.filter((owner) => Number(owner.is_active) === 1).length,
    inactive: owners.filter((owner) => Number(owner.is_active) !== 1).length,
  };

  return {
    owners,
    totalOwners: data?.total_owners ?? owners.length,
    isLoading,
    error,
    refetch,
    deleteMutation,
    updateMutation,
    counts,
  };
};
