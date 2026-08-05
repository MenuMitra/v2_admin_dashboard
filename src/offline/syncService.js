import axios from "axios";
import { API_CONFIG } from "../config/appConfig";
import { getDeviceId } from "../utils/deviceInfo";
import { db, SYNC_ENTITY_TABLES } from "./db";
import { isOnline } from "./network";
import {
  applyCategoryIdMapping,
  applyPulledCategories,
  categoryToPushPayload,
  upsertCategoriesFromServer,
} from "./repositories/categoriesRepo";
import {
  applyMenuIdMapping,
  applyPulledMenus,
  menuToPushPayload,
  upsertMenusFromServer,
} from "./repositories/menusRepo";

const { SYNC_URL, BASE_URL } = API_CONFIG;

let syncInFlight = null;
const listeners = new Set();

export function subscribeSyncState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitSyncState(state) {
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch {
      // ignore listener errors
    }
  });
}

async function getAuthHeaders() {
  let token = localStorage.getItem("token");
  if (!token) {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "null");
      if (auth?.access_token) {
        token = auth.access_token.startsWith("Bearer ")
          ? auth.access_token
          : `Bearer ${auth.access_token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return {
    Authorization: token,
    "Content-Type": "application/json",
  };
}

async function getLastSyncAt(outletId) {
  const meta = await db.syncMeta.get(Number(outletId));
  return meta?.last_sync_at ?? null;
}

export const DEFAULT_SYNC_INTERVAL_DAYS = 15;
export const SYNC_INTERVAL_OPTIONS = [10, 15, 30];

export async function getSyncIntervalDays(outletId) {
  const meta = await db.syncMeta.get(Number(outletId));
  const days = Number(meta?.sync_interval_days);
  if (SYNC_INTERVAL_OPTIONS.includes(days)) return days;
  return DEFAULT_SYNC_INTERVAL_DAYS;
}

export async function setSyncIntervalDays(outletId, days) {
  const oid = Number(outletId);
  const interval = SYNC_INTERVAL_OPTIONS.includes(Number(days))
    ? Number(days)
    : DEFAULT_SYNC_INTERVAL_DAYS;
  const existing = (await db.syncMeta.get(oid)) || { outlet_id: oid };
  await db.syncMeta.put({
    ...existing,
    outlet_id: oid,
    sync_interval_days: interval,
    updated_at: new Date().toISOString(),
  });
  return interval;
}

/** True if never synced, or last sync is older than the configured interval. */
export async function isSyncDue(outletId) {
  const last = await getLastSyncAt(outletId);
  if (!last) return true;
  const intervalDays = await getSyncIntervalDays(outletId);
  const elapsedMs = Date.now() - new Date(last).getTime();
  return elapsedMs >= intervalDays * 24 * 60 * 60 * 1000;
}

export async function getDaysUntilNextSync(outletId) {
  const last = await getLastSyncAt(outletId);
  const intervalDays = await getSyncIntervalDays(outletId);
  if (!last) return 0;
  const elapsedMs = Date.now() - new Date(last).getTime();
  const remainingMs = intervalDays * 24 * 60 * 60 * 1000 - elapsedMs;
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
}

async function setLastSyncAt(outletId, serverTime) {
  const oid = Number(outletId);
  const existing = (await db.syncMeta.get(oid)) || { outlet_id: oid };
  await db.syncMeta.put({
    ...existing,
    outlet_id: oid,
    last_sync_at: serverTime || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

/** Map local rows → POST /v1/sync push payloads (sync_uuid FK refs per API contract). */
function rowToPushPayload(table, row) {
  const active = Boolean(row.is_active !== false && !row.deleted);

  switch (table) {
    case "combo_master":
      return {
        sync_uuid: row.sync_uuid,
        outlet_id: Number(row.outlet_id),
        name: row.name,
        combo_price: Number(row.combo_price ?? 0),
        food_type: row.food_type || "",
        is_active: active,
      };
    case "combo_menu_mapping":
      return {
        sync_uuid: row.sync_uuid,
        combo_master_id: row.combo_master_sync_uuid,
        menu_id: row.menu_sync_uuid,
        menu_portions_id: row.menu_portions_id ?? null,
      };
    case "orders":
      return {
        sync_uuid: row.sync_uuid,
        outlet_id: Number(row.outlet_id),
        order_type: row.order_type,
        order_status: row.order_status,
        total_amount: Number(row.total_amount ?? 0),
      };
    case "order_menu_mappings":
      return {
        sync_uuid: row.sync_uuid,
        order_id: row.order_sync_uuid,
        menu_id: row.menu_sync_uuid,
        quantity: Number(row.quantity ?? 1),
        price: Number(row.price ?? 0),
      };
    default:
      return null;
  }
}

async function collectDirtyPush(outletId) {
  const oid = Number(outletId);
  const push = {};

  const dirtyCategories = await db.menu_categories
    .where("outlet_id")
    .equals(oid)
    .filter((r) => r.dirty)
    .toArray();
  if (dirtyCategories.length) {
    push.menu_categories = dirtyCategories.map(categoryToPushPayload);
  }

  const dirtyMenus = await db.menus
    .where("outlet_id")
    .equals(oid)
    .filter((r) => r.dirty)
    .toArray();
  if (dirtyMenus.length) {
    push.menus = dirtyMenus.map(menuToPushPayload);
  }

  for (const table of [
    "combo_master",
    "combo_menu_mapping",
    "orders",
    "order_menu_mappings",
  ]) {
    const dirty = await db[table]
      .where("outlet_id")
      .equals(oid)
      .filter((r) => r.dirty)
      .toArray();
    if (dirty.length) {
      push[table] = dirty.map((r) => rowToPushPayload(table, r));
    }
  }

  return push;
}

async function applyIdMappings(idMappings = {}) {
  const catMap = idMappings.menu_categories || {};
  for (const [syncUuid, ids] of Object.entries(catMap)) {
    if (ids?.menu_cat_id != null) {
      await applyCategoryIdMapping(syncUuid, ids.menu_cat_id);
    }
  }

  const menuMap = idMappings.menus || {};
  for (const [syncUuid, ids] of Object.entries(menuMap)) {
    if (ids?.menu_id != null) {
      await applyMenuIdMapping(syncUuid, ids.menu_id);
    }
  }

  // Generic: mark applied entities clean for other tables
  for (const table of [
    "combo_master",
    "combo_menu_mapping",
    "orders",
    "order_menu_mappings",
  ]) {
    const map = idMappings[table] || {};
    for (const [syncUuid, ids] of Object.entries(map)) {
      const row = await db[table].get(syncUuid);
      if (!row) continue;
      const idKey = Object.keys(ids || {}).find((k) => k.endsWith("_id"));
      await db[table].put({
        ...row,
        ...(idKey ? { [idKey]: ids[idKey] } : {}),
        dirty: false,
      });
    }
  }
}

async function markAppliedClean(applied = {}) {
  for (const table of SYNC_ENTITY_TABLES) {
    const uuids = applied[table] || [];
    for (const syncUuid of uuids) {
      const row = await db[table].get(syncUuid);
      if (!row) continue;
      await db[table].put({ ...row, dirty: false });
    }
  }
}

async function applyPull(outletId, pull = {}) {
  if (pull.menu_categories?.length) {
    await applyPulledCategories(outletId, pull.menu_categories);
  }
  if (pull.menus?.length) {
    await applyPulledMenus(outletId, pull.menus);
  }

  for (const table of [
    "combo_master",
    "combo_menu_mapping",
    "orders",
    "order_menu_mappings",
  ]) {
    const items = pull[table];
    if (!items?.length) continue;
    for (const item of items) {
      const existing = item.sync_uuid
        ? await db[table].get(item.sync_uuid)
        : null;
      if (existing?.dirty) continue;
      await db[table].put({
        ...existing,
        ...item,
        outlet_id: Number(outletId),
        dirty: false,
        deleted: Boolean(item.deleted),
      });
    }
  }
}

/**
 * Bootstrap local DB from existing online list APIs when sync pull is empty.
 * Runs category + menu fetches in parallel with a short timeout.
 */
export async function bootstrapOutletFromOnlineApis(outletId, userId) {
  if (!isOnline() || !userId) return { categories: 0, menus: 0 };

  const headers = await getAuthHeaders();
  const oid = Number(outletId);
  const timeout = 8000;

  let categories = 0;
  let menus = 0;

  const [catResult, menuResult] = await Promise.allSettled([
    axios.post(
      `${BASE_URL}/common/menu_category_list`,
      {
        outlet_id: oid,
        user_id: userId,
        app_source: "admin_app",
      },
      { headers, timeout }
    ),
    axios.post(
      `${BASE_URL}/common/menu_list`,
      {
        outlet_id: oid,
        user_id: userId,
        app_source: "admin_app",
      },
      { headers, timeout }
    ),
  ]);

  if (catResult.status === "fulfilled") {
    const catRes = catResult.value;
    const list = catRes.data?.data?.menucat_details || [];
    await upsertCategoriesFromServer(oid, list);
    categories = list.length;

    if (catRes.data?.data?.outlet_info) {
      await db.outletCache.put({
        outlet_id: oid,
        ...catRes.data.data.outlet_info,
      });
    }
  }

  if (menuResult.status === "fulfilled") {
    const menuRes = menuResult.value;
    const list =
      (Array.isArray(menuRes.data?.detail) && menuRes.data.detail) ||
      menuRes.data?.data?.menus ||
      menuRes.data?.data?.menu_details ||
      (Array.isArray(menuRes.data?.data) ? menuRes.data.data : []) ||
      [];
    const menusList = Array.isArray(list) ? list : [];
    await upsertMenusFromServer(oid, menusList);
    menus = menusList.length;

    const outletName = menusList[0]?.outlet_name;
    if (outletName) {
      const existing = (await db.outletCache.get(oid)) || { outlet_id: oid };
      await db.outletCache.put({
        ...existing,
        outlet_id: oid,
        outlet_name: outletName,
      });
    }
  }

  return { categories, menus };
}

export async function getPendingDirtyCount(outletId) {
  const oid = Number(outletId);
  let count = 0;
  for (const table of SYNC_ENTITY_TABLES) {
    count += await db[table]
      .where("outlet_id")
      .equals(oid)
      .filter((r) => r.dirty)
      .count();
  }
  return count;
}

/**
 * Full sync cycle for one outlet: push dirty → apply mappings → apply pull.
 * Falls back to list-API bootstrap when local store is empty.
 *
 * @param {object} [options]
 * @param {boolean} [options.force=false] - Bypass sync interval (manual sync).
 * Auto/background syncs only run when the outlet interval (10/15/30 days) is due.
 */
export async function syncOutlet(
  outletId,
  { userId, forceBootstrap = false, force = false } = {}
) {
  if (!outletId) {
    return { ok: false, reason: "missing_outlet" };
  }

  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = (async () => {
    const oid = Number(outletId);

    try {
      if (!isOnline()) {
        return { ok: false, reason: "offline" };
      }

      const localCatCount = await db.menu_categories
        .where("outlet_id")
        .equals(oid)
        .count();
      const localMenuCount = await db.menus.where("outlet_id").equals(oid).count();
      const isEmpty = localCatCount === 0 && localMenuCount === 0;

      // Respect sync interval unless forced or first hydrate — check BEFORE UI "syncing"
      if (!force && !forceBootstrap && !isEmpty) {
        const due = await isSyncDue(oid);
        if (!due) {
          const interval = await getSyncIntervalDays(oid);
          const daysLeft = await getDaysUntilNextSync(oid);
          const pending = await getPendingDirtyCount(oid);
          emitSyncState({
            status: "idle",
            outletId: oid,
            pending,
            message: `Sync every ${interval} days — next in ${daysLeft} day(s)`,
          });
          return {
            ok: false,
            reason: "not_due",
            interval,
            daysLeft,
            pending,
          };
        }
      }

      emitSyncState({ status: "syncing", outletId: oid });

      if (forceBootstrap || isEmpty) {
        await bootstrapOutletFromOnlineApis(oid, userId);
      }

      const push = await collectDirtyPush(oid);
      const payload = {
        outlet_id: oid,
        device_id: getDeviceId(),
        last_sync_at: await getLastSyncAt(oid),
        push,
      };

      const headers = await getAuthHeaders();
      let responseData = null;

      try {
        const res = await axios.post(SYNC_URL, payload, {
          headers,
          timeout: 10000,
        });
        responseData = res.data?.data ?? res.data;
      } catch (err) {
        emitSyncState({
          status: "error",
          outletId: oid,
          message:
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Sync API unavailable — using local cache",
        });
        // Only bootstrap if local store is empty — avoid double network wait
        if (userId && isEmpty) {
          await bootstrapOutletFromOnlineApis(oid, userId);
        }
        return { ok: false, reason: "sync_api_error", error: err };
      }

      await applyIdMappings(responseData?.id_mappings || {});
      await markAppliedClean(responseData?.applied || {});
      await applyPull(oid, responseData?.pull || {});

      const afterCats = await db.menu_categories
        .where("outlet_id")
        .equals(oid)
        .count();
      if (afterCats === 0 && userId) {
        await bootstrapOutletFromOnlineApis(oid, userId);
      }

      await setLastSyncAt(oid, responseData?.server_time);

      const pending = await getPendingDirtyCount(oid);
      emitSyncState({
        status: "synced",
        outletId: oid,
        serverTime: responseData?.server_time,
        conflicts: responseData?.conflicts || [],
        pending,
        message: pending
          ? `${pending} change(s) still pending`
          : "All changes synced",
      });

      return {
        ok: true,
        data: responseData,
        pending,
      };
    } catch (error) {
      emitSyncState({
        status: "error",
        outletId: Number(outletId),
        message: error.message || "Sync failed",
      });
      return { ok: false, reason: "unexpected", error };
    } finally {
      syncInFlight = null;
    }
  })();

  return syncInFlight;
}

const hydrateInFlight = new Map();

/**
 * Non-blocking hydrate by default: UI can read IndexedDB immediately.
 * Pass { waitIfEmpty: true } on detail screens that need data on first visit.
 */
export async function ensureOutletHydrated(
  outletId,
  userId,
  { waitIfEmpty = false } = {}
) {
  const oid = Number(outletId);
  if (!oid) return;

  const count = await db.menu_categories
    .where("outlet_id")
    .equals(oid)
    .count();

  if (count === 0 && isOnline() && userId) {
    if (!hydrateInFlight.has(oid)) {
      const job = (async () => {
        try {
          await bootstrapOutletFromOnlineApis(oid, userId);
          try {
            const { queryClient } = await import(
              "../lib/react-query/queryClient"
            );
            const { queryKeys } = await import("../lib/react-query/queryKeys");
            queryClient.invalidateQueries({
              queryKey: queryKeys.categories.list(oid),
            });
            queryClient.invalidateQueries({
              queryKey: queryKeys.menus.list(String(oid)),
            });
            queryClient.invalidateQueries({
              queryKey: queryKeys.menus.list(oid),
            });
          } catch {
            // ignore
          }
        } finally {
          hydrateInFlight.delete(oid);
        }
      })();
      hydrateInFlight.set(oid, job);
    }
    if (waitIfEmpty) {
      await hydrateInFlight.get(oid);
    }
    return;
  }

  // Local data exists — sync in background only when due
  if (isOnline() && userId && !hydrateInFlight.has(oid)) {
    syncOutlet(oid, { userId, force: false }).catch(() => {});
  }
}
