import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "../../../config/appConfig";
import axios from "axios";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useCompanyDetails = (companyId, token, userId) => {
  const queryClient = useQueryClient();

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  };

  // Company details query
  const {
    data: company,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.companies.detail(companyId),
    queryFn: async () => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/view_company`,
        {
          company_id: parseInt(companyId),
          user_id: userId || 440, // Use dynamic user_id, fallback to 440 for backward compatibility
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Based on the API response format: {"detail": "Company details retrieved successfully", "data": {...}}
      console.log('Company details API response:', response.data);
      return response.data.data; // Extract the data field from response
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch company details";
      toastController.error(errorMessage);
    },
    enabled: !!companyId && !!token, // Only need companyId and token (user_id is dynamic)
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/delete_company`,
        {
          company_id: parseInt(companyId),
          user_id: userId || 440, // Use dynamic user_id, fallback to 440 for backward compatibility
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
    onSuccess: (data) => {
      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
      toastController.success(data.message || "Company deleted successfully");
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || "Failed to delete company";
      toastController.error(errorMessage);
    },
  });

  // Update owner status mutation
  const updateOwnerStatusMutation = useMutation({
    mutationFn: async ({ ownerUserId }) => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/toggle_owner_status`,
        {
          owner_user_id: parseInt(ownerUserId),
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
    onMutate: async ({ ownerUserId }) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queryKeys.companies.detail(companyId),
      });

      // 2. Snapshot the previous value
      const previousCompany = queryClient.getQueryData(
        queryKeys.companies.detail(companyId)
      );

      // 3. Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.companies.detail(companyId),
        (oldData) => {
          if (!oldData || !oldData.owners) return oldData;

          return {
            ...oldData,
            owners: oldData.owners.map((owner) =>
              owner.user_id === ownerUserId
                ? { ...owner, is_active: [1, "1", true].includes(owner.is_active) ? 0 : 1 }
                : owner
            ),
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousCompany };
    },
    onError: (err, variables, context) => {
      // 4. If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCompany) {
        queryClient.setQueryData(
          queryKeys.companies.detail(companyId),
          context.previousCompany
        );
      }

      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to update owner status";
      toastController.error(errorMessage);
    },
    onSuccess: (data) => {
      // 5. Optionally update with exact server data on success
      const responseData = data.data || data;
      const finalStatus = responseData.is_active;
      const updatedUserId = responseData.owner_user_id || responseData.user_id;

      queryClient.setQueryData(
        queryKeys.companies.detail(companyId),
        (oldData) => {
          if (!oldData || !oldData.owners) return oldData;

          return {
            ...oldData,
            owners: oldData.owners.map((owner) =>
              owner.user_id === updatedUserId
                ? { ...owner, is_active: finalStatus }
                : owner
            ),
          };
        }
      );

      toastController.success(
        data.detail || data.message || "Owner status updated successfully"
      );
    },
    onSettled: () => {
      // 6. Always refetch after error or success to ensure we are in sync with the server
      queryClient.invalidateQueries({
        queryKey: queryKeys.companies.detail(companyId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.superOwners.all });
    },
  });

  return {
    company,
    isLoading,
    error,
    refetch,
    deleteCompany: deleteCompanyMutation.mutate,
    isDeleting: deleteCompanyMutation.isPending,
    updateOwnerStatus: updateOwnerStatusMutation.mutate,
    isUpdatingOwner: updateOwnerStatusMutation.isPending,
    formatDate,
  };
};