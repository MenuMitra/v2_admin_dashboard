import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";
import { API_CONFIG } from "../../../config/appConfig";

const { BASE_URL } = API_CONFIG;

export const useWebsiteBookingDetails = (bookingId) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  const {
    data: booking,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.websiteBookings.detail(bookingId),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        `${BASE_URL}/admin/view_website_booking`,
        {
          user_id: adminData.user_id,
          booking_id: Number(bookingId),
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
    enabled: !!adminData?.user_id && !!bookingId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      await axios.post(
        `${BASE_URL}/admin/delete_website_booking`,
        {
          user_id: adminData.user_id,
          booking_id: Number(bookingId),
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.websiteBookings.all });
      toastController.success("Website booking deleted successfully");
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete website booking"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ is_active, notes }) => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        `${BASE_URL}/admin/update_website_booking`,
        {
          user_id: adminData.user_id,
          booking_id: Number(bookingId),
          is_active,
          notes,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.websiteBookings.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.websiteBookings.detail(bookingId),
      });
      toastController.success("Website booking updated successfully");
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to update website booking"
      );
    },
  });

  return {
    booking,
    isLoading,
    error,
    refetch,
    deleteBooking: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending || deleteMutation.isLoading,
    updateBooking: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending || updateMutation.isLoading,
  };
};
