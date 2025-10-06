import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { API_CONFIG } from "../../../config/appConfig";
import axios from "axios";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";

const { BASE_URL, API_VERSION } = API_CONFIG;

// Protected mobiles array
const PROTECTED_MOBILES = ["8806431723", "9767637798", "8600704616"];

export const useAdminDetails = (adminId) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
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

  // Admin details query
  const {
    data: admin,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.detail(adminId),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/view_admin`,
        { admin_id: parseInt(adminId), app_source: "admin" },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to fetch admin details";
      toastController.error(errorMessage);
    },
  });

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async () => {
      // Check if admin is protected
      if (admin && PROTECTED_MOBILES.includes(admin.mobile)) {
        throw new Error("Cannot delete protected admin");
      }

      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/delete_admin`,
        {
          admin_id: parseInt(adminId),
          user_id: adminData.user_id,
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
      if (data.detail === "Admin deleted successfully") {
        toastController.success("Admin deleted successfully");
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      }
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.detail || err.message || "Failed to delete admin";
      toastController.error(errorMessage);
    },
  });

  return {
    admin,
    isLoading,
    error,
    refetch,
    deleteAdmin: deleteAdminMutation.mutate,
    isDeleting: deleteAdminMutation.isLoading,
    formatDate,
    PROTECTED_MOBILES,
  };
};
