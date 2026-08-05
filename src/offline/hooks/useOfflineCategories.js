import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/react-query/queryKeys";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoriesActive,
  getCategoryById,
} from "../repositories/categoriesRepo";
import { db } from "../db";
import { ensureOutletHydrated, syncOutlet } from "../syncService";
import { isOnline } from "../network";

export function useOfflineCategories(outletId, userId) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(outletId),
    queryFn: async () => {
      const menucat_details = await listCategories(outletId);

      if (menucat_details.length === 0 && isOnline() && userId) {
        // First visit only — wait once to seed IndexedDB
        await ensureOutletHydrated(outletId, userId, { waitIfEmpty: true });
        const seeded = await listCategories(outletId);
        const outletInfo = await db.outletCache.get(Number(outletId));
        return {
          detail: "ok",
          data: {
            menucat_details: seeded,
            outlet_info: outletInfo || null,
          },
        };
      }

      // Instant path — hydrate/sync in background
      ensureOutletHydrated(outletId, userId);

      const outletInfo = await db.outletCache.get(Number(outletId));
      return {
        detail: "ok",
        data: {
          menucat_details,
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
      queryKey: queryKeys.categories.list(outletId),
    });
  };

  const createMutation = useMutation({
    mutationFn: async ({ name }) => createCategory({ outletId, name }),
    onSuccess: async () => {
      invalidate();
      if (isOnline()) syncOutlet(outletId, { userId, force: false }).catch(() => {});
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ menuCatIdOrUuid, name, isActive }) =>
      updateCategory({ outletId, menuCatIdOrUuid, name, isActive }),
    onSuccess: async () => {
      invalidate();
      if (isOnline()) syncOutlet(outletId, { userId, force: false }).catch(() => {});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ menuCatIdOrUuid }) =>
      deleteCategory(outletId, menuCatIdOrUuid),
    onSuccess: async () => {
      invalidate();
      if (isOnline()) syncOutlet(outletId, { userId, force: false }).catch(() => {});
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, selectedIds }) => {
      const isActive = action === "active";
      await setCategoriesActive(outletId, selectedIds, isActive);
    },
    onSuccess: async () => {
      invalidate();
      if (isOnline()) syncOutlet(outletId, { userId, force: false }).catch(() => {});
    },
  });

  return {
    categoriesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    bulkActionMutation,
    getCategoryById: (id) => getCategoryById(outletId, id),
  };
}
