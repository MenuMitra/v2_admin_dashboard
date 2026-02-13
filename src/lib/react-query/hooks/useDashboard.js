import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { API_CONFIG } from "../../../config/appConfig";
import { queryKeys } from "../queryKeys";

export const useDashboard = () => {
  const { getToken, logout } = useAuth();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Shared query function to fetch dashboard data
  const fetchDashboardData = async () => {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(
      `${BASE_URL}/admin/admin_home`,
      {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      logout();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const jsonResponse = await response.json();
    // Extract the nested data object from the API response
    return jsonResponse.data || jsonResponse;
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
      select: (data) => {
        // Prefer metrics if available, fallback to counts for backward compatibility
        const metrics = data.metrics || {};
        const counts = data.counts || {};
        const enquiry = data.enquiry_count || {};
        const orderCount = data.order_count || {};

        const totalOutlets = metrics.total_outlets ?? counts.outlet_count ?? 0;
        const totalLiveOutlets =
          metrics.total_live_outlets ?? counts.live_outlet_count ?? 0;
        const totalInactiveOutlets =
          metrics.total_inactive_outlets ??
          counts.inactive_outlet_count ??
          (totalOutlets && totalLiveOutlets !== undefined
            ? Math.max(totalOutlets - totalLiveOutlets, 0)
            : 0);

        return {
          // Outlets
          total_outlets: totalOutlets,
          total_live_outlets: totalLiveOutlets,
          total_inactive_outlets: totalInactiveOutlets,

          // Orders
          total_orders:
            orderCount.total_orders ??
            metrics.total_orders ??
            counts.total_order_count ??
            0,
          paid_orders: orderCount.total_paid ?? counts.paid_order_count ?? 0,
          cooking_orders:
            orderCount.total_cooking ?? counts.cooking_order_count ?? 0,
          total_earning:
            metrics.total_earning ?? counts.total_earning_count ?? 0,

          // Enquiry
          total_enquiries: enquiry.enquiry ?? counts.enquiry_count ?? 0,
          positive_count: enquiry.positive ?? counts.positive_count ?? 0,
          onboard_count: enquiry.onboard ?? counts.onboard_count ?? 0,
        };
      },
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    });
  };

  return {
    useDashboardData,
    useCardData,
  };
};
