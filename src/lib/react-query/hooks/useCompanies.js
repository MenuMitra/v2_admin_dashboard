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
          user_id: userId || 440  // Use dynamic user_id, fallback to 440 for backward compatibility
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
    enabled: !!token, // Only run if token exists (user_id is dynamic)
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
          user_id: userId || 440, // Use dynamic user_id, fallback to 440 for backward compatibility
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
    mutationFn: async ({ companyIds, action }) => {
      console.log('Bulk action:', { companyIds, action });
      
      const response = await axios.post(
        `${BASE_URL}/common/bulk_company_action`,
        {
          user_id: userId || 440, // Use dynamic user_id, fallback to 440 for backward compatibility
          action: action,
          app_source: "admin",
          company_ids: companyIds,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log('Bulk action response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Bulk action successful:', data);
      // Invalidate and refetch companies list after successful bulk action
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list() });
    },
    onError: (error) => {
      console.error('Bulk action mutation error:', error);
    },
  });

  return {
    companies: companiesQuery.data ?? [],
    isLoading: companiesQuery.isLoading,
    error: companiesQuery.error,
    deleteCompany: deleteCompanyMutation.mutate,
    isDeleting: deleteCompanyMutation.isLoading,
    deleteError: deleteCompanyMutation.error,
    bulkAction: bulkActionMutation.mutate,
    isBulkActioning: bulkActionMutation.isLoading,
    bulkActionError: bulkActionMutation.error,
    refetch: companiesQuery.refetch,
  };
}