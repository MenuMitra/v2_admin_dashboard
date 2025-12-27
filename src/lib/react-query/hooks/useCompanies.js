import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_CONFIG } from '../../../config/appConfig';
import { queryKeys } from '../queryKeys';

const { BASE_URL, API_VERSION } = API_CONFIG;

export function useCompanies(token, userId) {
  const queryClient = useQueryClient();

  // List companies query
  const companiesQuery = useQuery({
    queryKey: queryKeys.companies.list(),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/admin/list_companies`,
        {
          user_id: 440  // Use hardcoded user_id as per requirements
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Based on the API response format: {"detail": "Companies retrieved successfully", "companies": [...]}
      // Extract companies from the response
      const companies = response.data.companies || [];
      
      // Ensure we return an array
      if (!Array.isArray(companies)) {
        console.warn('Companies is not an array, returning empty array');
        return [];
      }
      
      return companies;
    },
    enabled: !!token, // Only run if token exists (user_id is hardcoded to 440)
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async ({ companyId, userId }) => {
      console.log('Deleting company:', { companyId, userId });
      
      const response = await axios.post(
        `${BASE_URL}/admin/delete_company`,
        {
          company_id: companyId,
          user_id: 440, // Use hardcoded user_id as per requirements
          app_source: "admin",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log('Delete response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Delete successful:', data);
      // Invalidate and refetch companies list after successful deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ userIds, action, userId }) => {
      const response = await axios.post(
        `${BASE_URL}/common/bulk_company_action`,
        {
          user_ids: userIds,
          action: action,
          user_id: parseInt(userId),
          app_source: "admin_app",
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
      // Invalidate and refetch companies list after successful bulk action
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
    },
  });

  return {
    companies: companiesQuery.data || [],
    isLoading: companiesQuery.isLoading,
    error: companiesQuery.error,
    refetch: companiesQuery.refetch,
    
    // Delete mutation
    deleteCompany: deleteCompanyMutation.mutate,
    isDeleting: deleteCompanyMutation.isPending,
    deleteError: deleteCompanyMutation.error,
    
    // Bulk action mutation
    bulkAction: bulkActionMutation.mutate,
    isBulkActioning: bulkActionMutation.isPending,
    bulkActionError: bulkActionMutation.error,
  };
}