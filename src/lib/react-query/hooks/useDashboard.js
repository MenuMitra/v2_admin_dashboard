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

    return response.json();
  };

  // Main dashboard data query (API returns { detail, data: { outlet_data, counts, ... } })
  const useDashboardData = () => {
    return useQuery({
      queryKey: queryKeys.dashboard.home(),
      queryFn: fetchDashboardData,
      select: (response) => {
        const data = response?.data ?? response;
        return {
          outlet_data: data.outlet_data || [],
          counts: {
            customer_count: data.counts?.customer_count || 0,
            owner_count: data.counts?.owner_count || 0,
            outlet_count: data.counts?.outlet_count || 0,
            partner_count: data.counts?.partner_count || 0,
            guest_count: data.counts?.guest_count || 0,
          },
        };
      },
    });
  };

  // Card data query with auto-refresh (API returns { detail, data: { metrics, enquiry_count, order_count, ... } })
  const useCardData = () => {
    return useQuery({
      queryKey: queryKeys.dashboard.home(),
      queryFn: fetchDashboardData,
      select: (response) => {
        const data = response?.data ?? response;
        const metrics = data.metrics || {};
        const counts = data.counts || {};
        const enquiry = data.enquiry_count || {};
        const orderCount = data.order_count || {};

        const totalOutlets =
          Number(metrics.total_outlets) ?? Number(counts.outlet_count) ?? 0;
        const totalLiveOutlets =
          Number(metrics.total_live_outlets) ??
          Number(counts.live_outlet_count) ??
          0;
        const totalInactiveOutlets =
          Number(metrics.total_inactive_outlets) ??
          Number(counts.inactive_outlet_count) ??
          (totalOutlets && totalLiveOutlets !== undefined
            ? Math.max(totalOutlets - totalLiveOutlets, 0)
            : 0);

        return {
          // Outlets (from metrics: total_outlets, total_live_outlets, total_inactive_outlets)
          total_outlets: totalOutlets,
          total_live_outlets: totalLiveOutlets,
          total_inactive_outlets: totalInactiveOutlets,

          // Orders (from order_count: total_orders, total_paid, total_cooking)
          total_orders:
            Number(orderCount.total_orders) ??
            Number(metrics.total_orders) ??
            Number(counts.total_order_count) ??
            0,
          paid_orders:
            Number(orderCount.total_paid) ?? Number(counts.paid_order_count) ?? 0,
          cooking_orders:
            Number(orderCount.total_cooking) ??
            Number(counts.cooking_order_count) ??
            0,
          total_earning:
            Number(metrics.total_earning) ??
            Number(counts.total_earning_count) ??
            0,

          // Enquiry (from enquiry_count: enquiry, positive, onboard)
          total_enquiries:
            Number(enquiry.enquiry) ?? Number(counts.enquiry_count) ?? 0,
          positive_count:
            Number(enquiry.positive) ?? Number(counts.positive_count) ?? 0,
          onboard_count:
            Number(enquiry.onboard) ?? Number(counts.onboard_count) ?? 0,
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
