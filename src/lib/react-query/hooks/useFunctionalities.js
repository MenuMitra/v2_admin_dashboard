import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { API_CONFIG } from '../../../config/appConfig';
import { queryKeys } from '../queryKeys';
import { toastController } from '../../../utils/toastController';

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useFunctionalities = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // List Query
  const {
    data: functionalities = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.functionalities.list(),
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/get_ubac_functionalities`,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (err) => {
      toastController.error(err.response?.data?.detail || "Failed to fetch functionalities");
    },
  });

  // Create Functionality Mutation
  const createMutation = useMutation({
    mutationFn: async (functionalityName) => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/create_ubac_functionality`,
        {
          functionality_name: functionalityName,
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.functionalities.list());
      toastController.success("Functionality created successfully!");
    },
    onError: (error) => {
      toastController.error(error.response?.data?.detail || "Failed to create functionality");
    },
  });

  // Update Functionality Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ functionalityId, functionalityName }) => {
      const response = await axios.put(
        `${BASE_URL}/${API_VERSION}/admin/update_ubac_functionality`,
        {
          functionality_id: functionalityId,
          functionality_name: functionalityName,
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.functionalities.list());
      toastController.success("Functionality updated successfully!");
    },
    onError: (error) => {
      toastController.error(error.response?.data?.detail || "Failed to update functionality");
    },
  });

  // Delete Functionality Mutation
  const deleteMutation = useMutation({
    mutationFn: async (functionalityId) => {
      const response = await axios.delete(
        `${BASE_URL}/${API_VERSION}/admin/delete_ubac_functionality/${functionalityId}`,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.functionalities.list());
      toastController.success("Functionality deleted successfully!");
    },
    onError: (error) => {
      toastController.error(error.response?.data?.detail || "Failed to delete functionality");
    },
  });

  return {
    functionalities,
    isLoading,
    error,
    createFunctionality: createMutation.mutate,
    isCreating: createMutation.isLoading,
    updateFunctionality: updateMutation.mutate,
    isUpdating: updateMutation.isLoading,
    deleteFunctionality: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
    refetchFunctionalities: () => queryClient.invalidateQueries(queryKeys.functionalities.list()),
  };
}; 