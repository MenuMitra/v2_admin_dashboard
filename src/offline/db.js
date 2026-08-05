import Dexie from "dexie";

/**
 * Local-first IndexedDB for outlet sync entities.
 * sync_uuid is the client primary key used by POST /v1/sync.
 */
export const db = new Dexie("menusmitra_offline");

db.version(1).stores({
  syncMeta: "outlet_id",
  menu_categories: "sync_uuid, outlet_id, menu_cat_id, dirty, deleted",
  menus: "sync_uuid, outlet_id, menu_id, menu_cat_sync_uuid, dirty, deleted",
  combo_master: "sync_uuid, outlet_id, combo_master_id, dirty, deleted",
  combo_menu_mapping:
    "sync_uuid, outlet_id, combo_menu_mapping_id, combo_master_sync_uuid, menu_sync_uuid, dirty, deleted",
  orders: "sync_uuid, outlet_id, order_id, dirty, deleted",
  order_menu_mappings:
    "sync_uuid, outlet_id, order_menu_mapping_id, order_sync_uuid, menu_sync_uuid, dirty, deleted",
  outletCache: "outlet_id",
});

export const SYNC_ENTITY_TABLES = [
  "menu_categories",
  "menus",
  "combo_master",
  "combo_menu_mapping",
  "orders",
  "order_menu_mappings",
];

export function createSyncUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default db;
