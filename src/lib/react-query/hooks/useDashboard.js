import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { API_CONFIG } from '../../../config/appConfig';
import { queryKeys } from '../queryKeys';

export const useDashboard = () => {
  const { getToken, logout } = useAuth();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Shared query function to fetch dashboard data
  const fetchDashboardData = async () => {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`${BASE_URL}/${API_VERSION}/admin/admin_home`, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      logout();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    return response.json();
  };

  // Main dashboard data query
  const useDashboardData = () => {
    return useQuery({
      queryKey: queryKeys.dashboard.home(),
      queryFn: fetchDashboardData,
      select: (data) => ({
        outlet_data: data.outlet_data || [],
        counts: {
          customer_count: data.counts?.customer_count || 0,
          owner_count: data.counts?.owner_count || 0,
          outlet_count: data.counts?.outlet_count || 0,
          partner_count: data.counts?.partner_count || 0,
          guest_count: data.counts?.guest_count || 0,
        },
      }),
    });
  };

  // Card data query with auto-refresh
  const useCardData = () => {
    return useQuery({
      queryKey: queryKeys.dashboard.home(),
      queryFn: fetchDashboardData,
      select: (data) => ({
        total_live_outlets: data.counts?.live_outlet_count || 0,
        total_outlets: data.counts?.outlet_count || 0,
        total_orders: data.counts?.total_order_count || 0,
        total_earning: data.counts?.total_earning_count || 0,
      }),
      refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    });
  };

  return {
    useDashboardData,
    useCardData,
  };
}; 