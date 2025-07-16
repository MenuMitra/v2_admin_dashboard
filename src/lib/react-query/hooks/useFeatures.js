import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { toastController } from '../../../utils/toastController';
import { queryKeys } from '../queryKeys';
import { API_CONFIG } from '../../../config/appConfig';

const { BASE_URL, API_VERSION } = API_CONFIG;

// Core features list
const CORE_FEATURES = [
  "user_app",
  "owner_app",
  "pos_app",
  "admin_app",
  "waiter_app",
  "captain_app",
  "cds_app",
  "kds_app",
];

export const useFeatures = () => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // List Query
  const {
    data: features = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.features.list(),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/list_features`,
        {
          user_id: adminData.user_id,
          app_source: 'admin_app',
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.detail === 'Feature list fetched successfully') {
        return response.data.data;
      }
      return [];
    },
    enabled: !!adminData?.user_id,
  });

  // Create Feature Mutation
  const createFeatureMutation = useMutation({
    mutationFn: async (featureName) => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/create_feature`,
        {
          name: featureName.toLowerCase().replace(/\s+/g, '_'),
          user_id: adminData.user_id,
          app_source: 'admin_app',
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.features.list());
      toastController.success('Feature created successfully!');
    },
    onError: (err) => {
      toastController.error(err.response?.data?.detail || 'Failed to create feature');
    },
  });

  // Update Feature Mutation
  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureId, name }) => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.put(
        `${BASE_URL}/${API_VERSION}/admin/update_feature`,
        {
          feature_id: featureId,
          name: name.toLowerCase().replace(/\s+/g, '_'),
          user_id: adminData.user_id,
          app_source: 'admin_app',
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.features.list());
      toastController.success('Feature updated successfully!');
    },
    onError: (err) => {
      toastController.error(err.response?.data?.detail || 'Failed to update feature');
    },
  });

  // Delete Feature Mutation
  const deleteFeatureMutation = useMutation({
    mutationFn: async (featureId) => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/delete_feature`,
        {
          feature_id: featureId,
          user_id: adminData.user_id,
          app_source: 'admin_app',
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.features.list());
      toastController.success('Feature deleted successfully!');
    },
    onError: (err) => {
      toastController.error(err.response?.data?.detail || 'Failed to delete feature');
    },
  });

  // Helper function to check if a feature is a core feature
  const isCoreFeature = (featureName) => CORE_FEATURES.includes(featureName);

  return {
    features,
    isLoading,
    error,
    refetch,
    createFeatureMutation,
    updateFeatureMutation,
    deleteFeatureMutation,
    isCoreFeature,
    CORE_FEATURES,
  };
}; 