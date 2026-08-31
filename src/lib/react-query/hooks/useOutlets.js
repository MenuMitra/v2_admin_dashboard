import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { API_CONFIG } from "../../../config/appConfig";
import { queryKeys } from "../queryKeys";
import { toastController } from "../../../utils/toastController";

const { BASE_URL } = API_CONFIG;

// Transform outlet data to match UI structure
const transformOutletData = (outlets) => {
  return outlets.map((outlet) => ({
    id: outlet.outlet_id,
    outlet_id: outlet.outlet_id, // Keep the original outlet_id field
    user_id: outlet.outlet_id,
    name: outlet.outlet_name,
    code: outlet.outlet_code,
    mobile: outlet.mobile,
    status: getOutletStatus(outlet.outlet_status, outlet.is_open),
    isOpen: Number(outlet.is_open),
    outletStatus: Number(outlet.outlet_status),
    image: [{}],
    accountType: outlet.account_type,
    ownerCount: outlet.owner_count,
    outlet_type: outlet.outlet_type,
    outlet_mode: outlet.outlet_mode,
    total_order_count: outlet.total_order_count,
    total_cooking_count: outlet.total_cooking_count,
    total_paid_count: outlet.total_paid_count,
    total_cancel_count: outlet.total_cancel_count,
    total_placed_count: outlet.total_placed_count,
    total_menu: outlet.total_menu,
    total_category: outlet.total_category,
    last_order_date: outlet.last_order_date,
    subscription_end_date:
      outlet.subscription_end_date ||
      outlet.subscription_details?.subscription_end_date ||
      outlet.subscription?.subscription_end_date ||
      null,
  }));
};

// Helper function to determine status
const getOutletStatus = (outlet_status, is_open) => {
  const status = Number(outlet_status);
  const open = Number(is_open);
  if (status === 1 && open === 1) return "success";
  if (status === 1 && open === 0) return "pending";
  return "failed";
};

export const useOutlets = () => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();

  // List Query
  const {
    data: outlets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.outlets.list(),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/common/listview_outlet`,
        {
          user_id: adminData?.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlets") {
        return transformOutletData(response.data.data);
      }
      throw new Error(response.data.message || "Failed to fetch outlets");
    },
    enabled: !!adminData?.user_id,
    staleTime: 0, // Data is immediately considered stale
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (outletId) => {
      const response = await axios.delete(
        `${BASE_URL}/common/delete_outlet`,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
          data: {
            outlet_id: outletId,
            user_id: adminData?.user_id,
            app_source: "admin",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.outlets.list());
      toastController.success("Outlet deleted successfully");
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.message || "Failed to delete outlet"
      );
    },
  });

  // Bulk Action Mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, outletIds }) => {
      const response = await axios.post(
        `${BASE_URL}/common/bulk_outlet_action`,
        {
          user_id: adminData.user_id,
          action: action,
          app_source: "admin_app",
          outlet_ids: outletIds,
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
      queryClient.invalidateQueries(queryKeys.outlets.list());
      toastController.success("Bulk action completed successfully");
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.message || "Failed to perform bulk action"
      );
    },
  });

  return {
    outlets,
    isLoading,
    error,
    deleteOutlet: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
    bulkAction: bulkActionMutation.mutate,
    isBulkActioning: bulkActionMutation.isLoading,
    refetch,
  };
};