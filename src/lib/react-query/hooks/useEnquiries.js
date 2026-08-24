import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../../config/appConfig";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";

const { BASE_URL } = API_CONFIG;

export function useEnquiries(token, filters = {}) {
  const queryClient = useQueryClient();
  const { status = "all", page = 1, page_size = 200 } = filters;

  const enquiriesQuery = useQuery({
    queryKey: queryKeys.enquiries.list({ status, page, page_size }),
    queryFn: async () => {
      const payload = {
        page,
        page_size,
      };

      if (status && status !== "all") {
        payload.status = status;
      }

      const response = await axios.post(
        `${BASE_URL}/admin/enquiry_list`,
        payload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const payloadBody = response.data?.data || {};
      const items = Array.isArray(payloadBody)
        ? payloadBody
        : Array.isArray(payloadBody.items)
          ? payloadBody.items
          : Array.isArray(response.data?.items)
            ? response.data.items
            : [];

      return {
        items,
        total: payloadBody.total ?? items.length,
        page: payloadBody.page ?? page,
        page_size: payloadBody.page_size ?? page_size,
      };
    },
    enabled: !!token,
    retry: 2,
    retryDelay: 1000,
  });

  const activateEnquiry = useMutation({
    mutationFn: async (enquiryId) => {
      const response = await axios.post(
        `${BASE_URL}/admin/enquiry_activate`,
        { enquiry_id: Number(enquiryId) },
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
    enquiries: enquiriesQuery.data?.items ?? [],
    total: enquiriesQuery.data?.total ?? 0,
    isLoading: enquiriesQuery.isLoading,
    error: enquiriesQuery.error,
    refetch: enquiriesQuery.refetch,
    activateEnquiry: activateEnquiry.mutateAsync,
    isActivating: activateEnquiry.isPending,
  };
}
