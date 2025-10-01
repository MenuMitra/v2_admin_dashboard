import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../../config/appConfig";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { queryKeys } from "../queryKeys";
import { toastController } from "../../../utils/toastController";

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useOwnerDetails = (ownerId) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // Owner details query
  const {
    data: ownerData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.owners.detail(ownerId),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/common/view_owner`,
          {
            user_id: adminData.user_id,
            owner_id: parseInt(ownerId),
            app_source: "admin",
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: "Loading owner details...",
          success: "Owner details loaded successfully!",
          error: "Failed to load owner details",
        }
      );

      return response.data;
    },
    enabled: Boolean(adminData?.user_id && ownerId),
  });

  // Delete owner mutation
  const deleteOwnerMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await toastController.promise(
        axios.delete(`${BASE_URL}/${API_VERSION}/common/delete_owner`, {
          data: {
            owner_id: parseInt(ownerId),
            user_id: adminData.user_id,
            app_source: "admin",
          },
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: "Deleting owner...",
          success: "Owner deleted successfully!",
          error: "Failed to delete owner",
        }
      );
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all });
    },
  });

  return {
    ownerData,
    isLoading,
    error,
    refetch,
    deleteOwner: deleteOwnerMutation.mutate,
    isDeleting: deleteOwnerMutation.isPending,
  };
};
