import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { toastController } from "../../../utils/toastController";
import { queryKeys } from "../queryKeys";
import { API_CONFIG } from "../../../config/appConfig";

const { BASE_URL } = API_CONFIG;

export const useOnboardingDetails = (onboardingId) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  const {
    data: onboarding,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.onboarding.detail(onboardingId),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        `${BASE_URL}/admin/onboarding/view`,
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

      return response.data?.data || response.data;
    },
    enabled: !!adminData?.user_id && !!onboardingId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
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

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.patch(
        `${BASE_URL}/admin/onboarding/update`,
        {
          onboarding_id: Number(onboardingId),
          ...payload,
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboarding.detail(onboardingId),
      });
      toastController.success(
        res?.detail || "Onboarding updated successfully"
      );
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to update onboarding"
      );
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboarding.detail(onboardingId),
      });
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

  return {
    onboarding,
    isLoading,
    error,
    refetch,
    deleteOnboarding: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending || deleteMutation.isLoading,
    updateOnboarding: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending || updateMutation.isLoading,
    activateOnboarding: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending || activateMutation.isLoading,
  };
};
