import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../../config/appConfig";
import { queryKeys } from "../queryKeys";

const { BASE_URL, API_VERSION } = API_CONFIG;

export function useStaff(token, outletId, adminUserId) {
  const queryClient = useQueryClient();

  const staffQuery = useQuery({
    queryKey: queryKeys.staff.list(outletId),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/common/staff_listview`,
        {
          outlet_id: Number(outletId),
          user_id: adminUserId,
          app_source: "admin_app",
        },
        {
          headers: { Authorization: token, "Content-Type": "application/json" },
        }
      );
      return response.data;
    },
    enabled: !!token && !!outletId,
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ user_id, action, staff_ids, outlet_id }) => {
      const response = await axios.post(
        `${BASE_URL}/common/bulk_staff_action`,
        {
          user_id: String(user_id),
          action,
          app_source: "admin_app",
          staff_ids,
          outlet_id: String(outlet_id),
        },
        {
          headers: { Authorization: token, "Content-Type": "application/json" },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.list(outletId),
      });
    },
  });

  return {
    staffData: staffQuery.data ?? { lists: [] },
    isLoading: staffQuery.isLoading,
    error: staffQuery.error,
    bulkAction: bulkActionMutation.mutate,
    isBulkActioning: bulkActionMutation.isLoading,
    bulkActionError: bulkActionMutation.error,
    refetch: staffQuery.refetch,
  };
}
