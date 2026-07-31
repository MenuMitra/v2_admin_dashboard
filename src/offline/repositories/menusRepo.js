import { db, createSyncUuid } from "../db";

/**
 * Map local menu row → ManageMenus / CreateMenu UI shape.
 */
export function toMenuListItem(row) {
  return {
    sync_uuid: row.sync_uuid,
    menu_id: row.menu_id ?? row.sync_uuid,
    outlet_id: row.outlet_id,
    menu_cat_id: row.menu_cat_id ?? row.menu_cat_sync_uuid,
    menu_cat_sync_uuid: row.menu_cat_sync_uuid,
    category_name: row.category_name || "",
    name: row.name,
    price: row.price,
    food_type: row.food_type,
    spicy_index: row.spicy_index ?? "",
    ingredients: row.ingredients ?? "",
    is_active: row.is_active ? 1 : 0,
    images: row.images || [],
    dirty: row.dirty,
    deleted: row.deleted,
  };
}

export async function listMenus(outletId) {
  const oid = Number(outletId);
  const rows = await db.menus
    .where("outlet_id")
    .equals(oid)
    .filter((r) => !r.deleted)
    .toArray();

  const active = rows.filter((r) => r.is_active).length;
  const inactive = rows.length - active;

  return rows.map((row) => ({
    ...toMenuListItem(row),
    total_active_menus: active,
    total_inactive_menus: inactive,
  }));
}

/** Menus belonging to a category (by server id or sync_uuid). */
export async function listMenusByCategory(outletId, menuCatIdOrUuid) {
  const oid = Number(outletId);
  const key = String(menuCatIdOrUuid);
  const rows = await db.menus
    .where("outlet_id")
    .equals(oid)
    .filter(
      (r) =>
        !r.deleted &&
        (String(r.menu_cat_id) === key ||
          r.menu_cat_sync_uuid === key ||
          String(r.menu_cat_sync_uuid) === key)
    )
    .toArray();

  return rows.map((row) => ({
    menu_id: row.menu_id ?? row.sync_uuid,
    sync_uuid: row.sync_uuid,
    menu_name: row.name,
    food_type: row.food_type,
    default_price: row.price,
  }));
}

export async function getMenuById(outletId, menuIdOrUuid) {
  const oid = Number(outletId);
  const key = String(menuIdOrUuid);
  let row = await db.menus.get(key);
  if (!row || Number(row.outlet_id) !== oid) {
    row = await db.menus
      .where("outlet_id")
      .equals(oid)
      .filter(
        (r) =>
          !r.deleted &&
          (String(r.menu_id) === key || r.sync_uuid === key)
      )
      .first();
  }
  if (!row || row.deleted) return null;
  return toMenuListItem(row);
}

async function resolveCategorySyncUuid(outletId, menuCatIdOrUuid) {
  const oid = Number(outletId);
  const key = String(menuCatIdOrUuid);
  let cat = await db.menu_categories.get(key);
  if (!cat || Number(cat.outlet_id) !== oid) {
    cat = await db.menu_categories
      .where("outlet_id")
      .equals(oid)
      .filter(
        (r) => String(r.menu_cat_id) === key || r.sync_uuid === key
      )
      .first();
  }
  return cat
    ? {
        menu_cat_sync_uuid: cat.sync_uuid,
        menu_cat_id: cat.menu_cat_id,
        category_name: cat.name,
      }
    : {
        menu_cat_sync_uuid: key,
        menu_cat_id: null,
        category_name: "",
      };
}

export async function createMenu({
  outletId,
  menuCatId,
  name,
  price,
  foodType,
  spicyIndex = "",
  ingredients = "",
  images = [],
  isActive = true,
}) {
  const sync_uuid = createSyncUuid();
  const now = new Date().toISOString();
  const cat = await resolveCategorySyncUuid(outletId, menuCatId);

  const row = {
    sync_uuid,
    outlet_id: Number(outletId),
    menu_id: null,
    menu_cat_id: cat.menu_cat_id,
    menu_cat_sync_uuid: cat.menu_cat_sync_uuid,
    category_name: cat.category_name,
    name: name.trim(),
    price: Number(price),
    food_type: foodType,
    spicy_index: spicyIndex,
    ingredients: ingredients.trim(),
    images,
    is_active: Boolean(isActive),
    dirty: true,
    deleted: false,
    updated_at: now,
    created_at: now,
  };
  await db.menus.put(row);
  return toMenuListItem(row);
}

export async function updateMenu({
  outletId,
  menuIdOrUuid,
  menuCatId,
  name,
  price,
  foodType,
  spicyIndex,
  ingredients,
  images,
  isActive,
}) {
  const existing = await getMenuRaw(outletId, menuIdOrUuid);
  if (!existing) throw new Error("Menu not found locally");

  let catFields = {
    menu_cat_id: existing.menu_cat_id,
    menu_cat_sync_uuid: existing.menu_cat_sync_uuid,
    category_name: existing.category_name,
  };
  if (menuCatId != null) {
    catFields = await resolveCategorySyncUuid(outletId, menuCatId);
  }

  const updated = {
    ...existing,
    ...catFields,
    name: name != null ? name.trim() : existing.name,
    price: price != null ? Number(price) : existing.price,
    food_type: foodType != null ? foodType : existing.food_type,
    spicy_index: spicyIndex != null ? spicyIndex : existing.spicy_index,
    ingredients:
      ingredients != null ? ingredients.trim() : existing.ingredients,
    images: images != null ? images : existing.images,
    is_active: isActive != null ? Boolean(isActive) : existing.is_active,
    dirty: true,
    updated_at: new Date().toISOString(),
  };
  await db.menus.put(updated);
  return toMenuListItem(updated);
}

export async function deleteMenu(outletId, menuIdOrUuid) {
  const existing = await getMenuRaw(outletId, menuIdOrUuid);
  if (!existing) return;

  if (existing.menu_id == null && existing.dirty) {
    await db.menus.delete(existing.sync_uuid);
    return;
  }

  await db.menus.put({
    ...existing,
    deleted: true,
    dirty: true,
    is_active: false,
    updated_at: new Date().toISOString(),
  });
}

export async function setMenusActive(outletId, ids, isActive) {
  for (const id of ids) {
    await updateMenu({
      outletId,
      menuIdOrUuid: id,
      isActive,
    });
  }
}

async function getMenuRaw(outletId, menuIdOrUuid) {
  const oid = Number(outletId);
  const key = String(menuIdOrUuid);
  let row = await db.menus.get(key);
  if (row && Number(row.outlet_id) === oid) return row;
  return db.menus
    .where("outlet_id")
    .equals(oid)
    .filter((r) => String(r.menu_id) === key || r.sync_uuid === key)
    .first();
}

export async function upsertMenusFromServer(outletId, serverMenus) {
  const oid = Number(outletId);
  const now = new Date().toISOString();

  for (const menu of serverMenus) {
    if (!menu.menu_id || !menu.name) continue;

    const existing = await db.menus
      .where("outlet_id")
      .equals(oid)
      .filter((r) => Number(r.menu_id) === Number(menu.menu_id))
      .first();

    if (existing?.dirty) continue;

    const cat = await resolveCategorySyncUuid(
      outletId,
      menu.menu_cat_id
    );

    const sync_uuid = existing?.sync_uuid || createSyncUuid();
    await db.menus.put({
      sync_uuid,
      outlet_id: oid,
      menu_id: Number(menu.menu_id),
      menu_cat_id: menu.menu_cat_id != null ? Number(menu.menu_cat_id) : null,
      menu_cat_sync_uuid: cat.menu_cat_sync_uuid,
      category_name: menu.category_name || cat.category_name || "",
      name: menu.name,
      price: Number(menu.price ?? menu.portion_data?.[0]?.price ?? 0),
      food_type: menu.food_type || "",
      spicy_index: menu.spicy_index ?? "",
      ingredients: menu.ingredients ?? "",
      images: menu.images || [],
      is_active: menu.is_active === 1 || menu.is_active === true,
      dirty: false,
      deleted: false,
      updated_at: now,
      created_at: existing?.created_at || now,
    });
  }
}

export async function applyMenuIdMapping(syncUuid, menuId) {
  const row = await db.menus.get(syncUuid);
  if (!row) return;
  await db.menus.put({
    ...row,
    menu_id: Number(menuId),
    dirty: false,
    deleted: false,
  });
}

export async function applyPulledMenus(outletId, items = []) {
  const oid = Number(outletId);
  const now = new Date().toISOString();
  for (const item of items) {
    const sync_uuid = item.sync_uuid || createSyncUuid();
    const existing = await db.menus.get(sync_uuid);
    if (existing?.dirty) continue;

    const cat = await resolveCategorySyncUuid(
      outletId,
      item.menu_cat_id
    );

    await db.menus.put({
      sync_uuid,
      outlet_id: oid,
      menu_id: item.menu_id ?? existing?.menu_id ?? null,
      menu_cat_id:
        typeof item.menu_cat_id === "number"
          ? item.menu_cat_id
          : cat.menu_cat_id,
      menu_cat_sync_uuid:
        typeof item.menu_cat_id === "string"
          ? item.menu_cat_id
          : cat.menu_cat_sync_uuid,
      category_name: item.category_name || cat.category_name || "",
      name: item.name,
      price: Number(item.price ?? 0),
      food_type: item.food_type || "",
      spicy_index: item.spicy_index ?? "",
      ingredients: item.ingredients ?? "",
      images: item.images || existing?.images || [],
      is_active: item.is_active !== false && item.is_active !== 0,
      dirty: false,
      deleted: Boolean(item.deleted),
      updated_at: item.updated_at || now,
      created_at: existing?.created_at || now,
    });
  }
}

export function menuToPushPayload(row) {
  return {
    sync_uuid: row.sync_uuid,
    outlet_id: Number(row.outlet_id),
    menu_cat_id: row.menu_cat_sync_uuid,
    name: row.name,
    price: Number(row.price),
    food_type: row.food_type,
    is_active: Boolean(row.is_active) && !row.deleted,
  };
}
