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
      const menus = await listMenus(outletId);

      if (menus.length === 0 && isOnline() && userId) {
        await ensureOutletHydrated(outletId, userId, { waitIfEmpty: true });
        const seeded = await listMenus(outletId);
        const outletInfo = await db.outletCache.get(Number(outletId));
        const outletName = outletInfo?.outlet_name || "";
        return {
          detail: seeded.map((m) => ({
            ...m,
            outlet_name: m.outlet_name || outletName,
          })),
          data: {
            menus: seeded,
            outlet_info: outletInfo || null,
          },
        };
      }

      ensureOutletHydrated(outletId, userId);

      const outletInfo = await db.outletCache.get(Number(outletId));
      const outletName = outletInfo?.outlet_name || "";
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
    staleTime: 30_000,
    placeholderData: (prev) => prev,
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
      if (isOnline()) syncOutlet(outletId, { userId, force: false }).catch(() => {});
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => updateMenu({ outletId, ...payload }),
    onSuccess: async () => {
      invalidate();
      if (isOnline()) syncOutlet(outletId, { userId, force: false }).catch(() => {});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ menuIdOrUuid }) =>
      deleteMenu(outletId, menuIdOrUuid),
    onSuccess: async () => {
      invalidate();
      if (isOnline()) syncOutlet(outletId, { userId, force: false }).catch(() => {});
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, selectedIds }) => {
      const isActive = action === "active";
      await setMenusActive(outletId, selectedIds, isActive);
    },
    onSuccess: async () => {
      invalidate();
      if (isOnline()) syncOutlet(outletId, { userId, force: false }).catch(() => {});
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
