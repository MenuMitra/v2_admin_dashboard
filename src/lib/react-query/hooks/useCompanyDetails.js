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
    mutationFn: async ({ owner, nextIsActive }) => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.patch(
        `${BASE_URL}/admin/update_super_owner`,
        {
          user_id: userId || 440,
          super_owner_id: parseInt(owner.owner_id),
          name: owner.name || "",
          mobile: owner.mobile || "",
          email: owner.email || "",
          aadhar_number: owner.aadhar || "",
          is_active: nextIsActive ? 1 : 0,
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
      // Invalidate current company details to refresh owners list
      queryClient.invalidateQueries({
        queryKey: queryKeys.companies.detail(companyId),
      });
      // Also invalidate super owners list to stay in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.superOwners.all });
      toastController.success(
        data.detail || data.message || "Owner status updated successfully"
      );
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to update owner status";
      toastController.error(errorMessage);
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