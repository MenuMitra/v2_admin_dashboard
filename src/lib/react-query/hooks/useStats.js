import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { API_CONFIG } from '../../../config/appConfig';
import { queryKeys } from '../queryKeys';

export const useStats = () => {
  const { getToken } = useAuth();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Helper function to format date for API
  const formatDateForApi = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return "";
    const [year, month, day] = yyyy_mm_dd.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // 1. API Usage Stats Query
  const useApiUsageStats = (filters) => {
    return useQuery({
      queryKey: queryKeys.stats.apiUsage(filters),
      queryFn: async () => {
        const response = await fetch(`${BASE_URL}/${API_VERSION}/admin/api_usage_stats`, {
          method: 'GET',
          headers: {
            Authorization: getToken(),
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch API usage stats');
        return response.json();
      },
    });
  };

  // 2. DB Tables Stats Query
  const useDbTableStats = () => {
    return useQuery({
      queryKey: queryKeys.stats.dbTables(),
      queryFn: async () => {
        const response = await fetch(`${BASE_URL}/${API_VERSION}/admin/table_stats`, {
          method: 'GET',
          headers: {
            Authorization: getToken(),
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch table statistics');
        return response.json();
      },
    });
  };

  // 3. App Usage Stats Query
  const useAppUsageStats = (filters) => {
    return useQuery({
      queryKey: queryKeys.stats.appUsage(filters),
      queryFn: async () => {
        const response = await fetch(`${BASE_URL}/${API_VERSION}/admin/app_usage_stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            start_date: filters.start_date,
            end_date: filters.end_date,
          }),
        });
        if (!response.ok) throw new Error('Failed to fetch app usage stats');
        return response.json();
      },
      enabled: Boolean(filters?.start_date && filters?.end_date),
    });
  };

  // 4. App Sources Query
  const useAppSources = () => {
    return useQuery({
      queryKey: queryKeys.stats.appSources(),
      queryFn: async () => {
        const response = await fetch(`${BASE_URL}/${API_VERSION}/common/get_list/app_source`, {
          method: 'GET',
          headers: {
            Authorization: getToken(),
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch app sources');
        const data = await response.json();
        
        // Transform the app_source_list object into dropdown format
        return Object.entries(data.app_source_list).map(([value, label]) => ({
          value,
          label: label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }));
      },
    });
  };

  return {
    useApiUsageStats,
    useDbTableStats,
    useAppUsageStats,
    useAppSources,
    formatDateForApi,
  };
}; 