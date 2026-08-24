import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../../config/appConfig";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";

const { BASE_URL } = API_CONFIG;

export function useEnquiryDetails(enquiryId, token) {
  const queryClient = useQueryClient();

  const enquiryQuery = useQuery({
    queryKey: queryKeys.enquiries.detail(enquiryId),
    queryFn: async () => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/enquiry_view`,
        { enquiry_id: Number(enquiryId) },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data?.data || null;
    },
    enabled: !!token && !!enquiryId,
  });

  const updateEnquiry = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `${BASE_URL}/admin/enquiry_update`,
        payload,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
      toastController.success(
        data?.detail || "Onboarding details updated successfully"
      );
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to update enquiry"
      );
    },
  });

  const activateEnquiry = useMutation({
    mutationFn: async (id) => {
      const response = await axios.post(
        `${BASE_URL}/admin/enquiry_activate`,
        { enquiry_id: Number(id) },
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
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all });
      const outletCode = data?.data?.outlet_code;
      toastController.success(
        outletCode
          ? `${data?.detail || "Onboarding activated successfully"}. Outlet code: ${outletCode}`
          : data?.detail || "Onboarding activated successfully"
      );
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to activate enquiry"
      );
    },
  });

  return {
    enquiry: enquiryQuery.data,
    isLoading: enquiryQuery.isLoading,
    error: enquiryQuery.error,
    refetch: enquiryQuery.refetch,
    updateEnquiry: updateEnquiry.mutateAsync,
    isUpdating: updateEnquiry.isPending,
    activateEnquiry: activateEnquiry.mutateAsync,
    isActivating: activateEnquiry.isPending,
  };
}
