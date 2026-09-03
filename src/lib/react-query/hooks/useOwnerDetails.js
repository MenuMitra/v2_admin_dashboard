import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";
import { API_CONFIG } from "../../../config/appConfig";

const { BASE_URL } = API_CONFIG;

export const useOwnerDetails = (ownerId) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  const {
    data: owner,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.owners.detail(ownerId),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        `${BASE_URL}/admin/view_owner`,
        {
          user_id: adminData.user_id,
          owner_id: Number(ownerId),
          app_source: "admin",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data?.data || response.data;
    },
    enabled: !!adminData?.user_id && !!ownerId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
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

  return {
    owner,
    isLoading,
    error,
    refetch,
    deleteOwner: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending || deleteMutation.isLoading,
  };
};
