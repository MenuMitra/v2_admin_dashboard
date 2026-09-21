import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";
import { API_CONFIG } from "../../../config/appConfig";

const { BASE_URL } = API_CONFIG;

export const useOnboarding = (filters = {}) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const { status = "pending" } = filters;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.onboarding.list({ status }),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const params = {};
      if (status && status !== "all") params.status = status;

      const response = await axios.get(
        `${BASE_URL}/admin/onboarding/listview`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          params,
        }
      );

      return {
        items: response.data?.items || [],
        total_records: response.data?.total_records ?? 0,
        detail: response.data?.detail,
      };
    },
    enabled: !!adminData?.user_id,
  });

  const onboardings = data?.items || [];

  const deleteMutation = useMutation({
    mutationFn: async (onboardingId) => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      await axios.delete(`${BASE_URL}/admin/onboarding/delete`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: {
          onboarding_id: Number(onboardingId),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      toastController.success("Onboarding deleted successfully");
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete onboarding"
      );
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (onboardingId) => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        `${BASE_URL}/admin/onboarding/activate`,
        {
          onboarding_id: Number(onboardingId),
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
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      toastController.success(
        res?.detail || "Onboarding activated successfully"
      );
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to activate onboarding"
      );
    },
  });

  const counts = {
    total: data?.total_records ?? onboardings.length,
  };

  return {
    onboardings,
    totalRecords: data?.total_records ?? onboardings.length,
    isLoading,
    error,
    refetch,
    deleteMutation,
    activateMutation,
    counts,
  };
};
