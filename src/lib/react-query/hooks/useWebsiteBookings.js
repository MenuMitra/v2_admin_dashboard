import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";
import { API_CONFIG } from "../../../config/appConfig";

const { BASE_URL } = API_CONFIG;

export const useWebsiteBookings = (filters = {}) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const {
    search = "",
    status = "all",
    page = 1,
    page_size = 200,
  } = filters;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.websiteBookings.list({
      search,
      status,
      page,
      page_size,
    }),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const payload = {
        user_id: adminData.user_id,
        page,
        page_size,
      };
      if (search?.trim()) payload.search = search.trim();
      if (status && status !== "all") payload.status = status;

      const response = await axios.post(
        `${BASE_URL}/admin/listview_website_booking`,
        payload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        items: response.data?.items || [],
        total_records: response.data?.total_records ?? 0,
        page: response.data?.page ?? page,
        page_size: response.data?.page_size ?? page_size,
        detail: response.data?.detail,
      };
    },
    enabled: !!adminData?.user_id,
  });

  const bookings = data?.items || [];

  const deleteMutation = useMutation({
    mutationFn: async (bookingId) => {
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
    mutationFn: async ({ booking_id, is_active, notes }) => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        `${BASE_URL}/admin/update_website_booking`,
        {
          user_id: adminData.user_id,
          booking_id: Number(booking_id),
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
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to update website booking"
      );
    },
  });

  const counts = {
    total: data?.total_records ?? bookings.length,
    active: bookings.filter((b) => b.is_active === true || Number(b.is_active) === 1)
      .length,
    inactive: bookings.filter(
      (b) => b.is_active !== true && Number(b.is_active) !== 1
    ).length,
  };

  return {
    bookings,
    totalRecords: data?.total_records ?? bookings.length,
    isLoading,
    error,
    refetch,
    deleteMutation,
    updateMutation,
    counts,
  };
};
