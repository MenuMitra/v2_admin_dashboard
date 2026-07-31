import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/react-query/queryKeys";
import {
  listMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  setMenusActive,
  getMenuById,
} from "../repositories/menusRepo";
import { db } from "../db";
import { ensureOutletHydrated, syncOutlet } from "../syncService";
import { isOnline } from "../network";

export function useOfflineMenus(outletId, userId) {
  const queryClient = useQueryClient();

  const menusQuery = useQuery({
    queryKey: queryKeys.menus.list(outletId),
    queryFn: async () => {
      await ensureOutletHydrated(outletId, userId);
      const menus = await listMenus(outletId);
      const outletInfo = await db.outletCache.get(Number(outletId));
      const outletName = outletInfo?.outlet_name || "";
      // Match online menu_list shape: response.data.detail = array
      return {
        detail: menus.map((m) => ({
          ...m,
          outlet_name: m.outlet_name || outletName,
        })),
        data: {
          menus,
          outlet_info: outletInfo || null,
        },
      };
    },
    enabled: Boolean(outletId && userId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.menus.list(outletId),
    });
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => createMenu({ outletId, ...payload }),
    onSuccess: async () => {
      invalidate();
      if (isOnline()) await syncOutlet(outletId, { userId, force: false });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => updateMenu({ outletId, ...payload }),
    onSuccess: async () => {
      invalidate();
      if (isOnline()) await syncOutlet(outletId, { userId, force: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ menuIdOrUuid }) =>
      deleteMenu(outletId, menuIdOrUuid),
    onSuccess: async () => {
      invalidate();
      if (isOnline()) await syncOutlet(outletId, { userId, force: false });
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, selectedIds }) => {
      const isActive = action === "active";
      await setMenusActive(outletId, selectedIds, isActive);
    },
    onSuccess: async () => {
      invalidate();
      if (isOnline()) await syncOutlet(outletId, { userId, force: false });
    },
  });

  return {
    menusQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    bulkActionMutation,
    getMenuById: (id) => getMenuById(outletId, id),
  };
}
