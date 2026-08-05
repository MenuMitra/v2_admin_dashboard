import { db, createSyncUuid } from "../db";

/**
 * Map local category row → shape expected by ManageCategories UI.
 */
export function toCategoryListItem(row) {
  return {
    sync_uuid: row.sync_uuid,
    menu_cat_id: row.menu_cat_id ?? row.sync_uuid,
    outlet_id: row.outlet_id,
    category_name: row.name,
    name: row.name,
    is_active: row.is_active ? 1 : 0,
    menu_count: row.menu_count ?? 0,
    total_active_categories: row.total_active_categories,
    total_inactive_categories: row.total_inactive_categories,
    dirty: row.dirty,
    deleted: row.deleted,
  };
}

export async function listCategories(outletId) {
  const oid = Number(outletId);
  const rows = await db.menu_categories
    .where("outlet_id")
    .equals(oid)
    .filter((r) => !r.deleted)
    .toArray();

  const active = rows.filter((r) => r.is_active).length;
  const inactive = rows.length - active;

  return rows.map((row) =>
    toCategoryListItem({
      ...row,
      total_active_categories: active,
      total_inactive_categories: inactive,
    })
  );
}

export async function getCategoryById(outletId, menuCatIdOrUuid) {
  const oid = Number(outletId);
  const key = String(menuCatIdOrUuid);
  let row = await db.menu_categories.get(key);
  if (!row || Number(row.outlet_id) !== oid) {
    row = await db.menu_categories
      .where("outlet_id")
      .equals(oid)
      .filter(
        (r) =>
          !r.deleted &&
          (String(r.menu_cat_id) === key || r.sync_uuid === key)
      )
      .first();
  }
  if (!row || row.deleted) return null;
  return toCategoryListItem(row);
}

export async function createCategory({ outletId, name, isActive = true }) {
  const sync_uuid = createSyncUuid();
  const now = new Date().toISOString();
  const row = {
    sync_uuid,
    outlet_id: Number(outletId),
    menu_cat_id: null,
    name: name.trim(),
    is_active: Boolean(isActive),
    menu_count: 0,
    dirty: true,
    deleted: false,
    updated_at: now,
    created_at: now,
  };
  await db.menu_categories.put(row);
  return toCategoryListItem(row);
}

export async function updateCategory({
  outletId,
  menuCatIdOrUuid,
  name,
  isActive,
}) {
  const existing = await getCategoryRaw(outletId, menuCatIdOrUuid);
  if (!existing) throw new Error("Category not found locally");

  const updated = {
    ...existing,
    name: name != null ? name.trim() : existing.name,
    is_active: isActive != null ? Boolean(isActive) : existing.is_active,
    dirty: true,
    updated_at: new Date().toISOString(),
  };
  await db.menu_categories.put(updated);
  return toCategoryListItem(updated);
}

export async function deleteCategory(outletId, menuCatIdOrUuid) {
  const existing = await getCategoryRaw(outletId, menuCatIdOrUuid);
  if (!existing) return;

  // Never-synced local create: hard delete
  if (existing.menu_cat_id == null && existing.dirty) {
    await db.menu_categories.delete(existing.sync_uuid);
    return;
  }

  await db.menu_categories.put({
    ...existing,
    deleted: true,
    dirty: true,
    is_active: false,
    updated_at: new Date().toISOString(),
  });
}

export async function setCategoriesActive(outletId, ids, isActive) {
  for (const id of ids) {
    await updateCategory({
      outletId,
      menuCatIdOrUuid: id,
      isActive,
    });
  }
}

async function getCategoryRaw(outletId, menuCatIdOrUuid) {
  const oid = Number(outletId);
  const key = String(menuCatIdOrUuid);
  let row = await db.menu_categories.get(key);
  if (row && Number(row.outlet_id) === oid) return row;
  return db.menu_categories
    .where("outlet_id")
    .equals(oid)
    .filter(
      (r) => String(r.menu_cat_id) === key || r.sync_uuid === key
    )
    .first();
}

/**
 * Seed / upsert categories from online list API without marking dirty.
 */
export async function upsertCategoriesFromServer(outletId, serverCategories) {
  const oid = Number(outletId);
  const now = new Date().toISOString();

  for (const cat of serverCategories) {
    if (!cat.menu_cat_id || !cat.category_name || cat.category_name === "all") {
      continue;
    }

    const existing = await db.menu_categories
      .where("outlet_id")
      .equals(oid)
      .filter((r) => Number(r.menu_cat_id) === Number(cat.menu_cat_id))
      .first();

    // Don't overwrite unsynced local edits
    if (existing?.dirty) continue;

    const sync_uuid = existing?.sync_uuid || createSyncUuid();
    await db.menu_categories.put({
      sync_uuid,
      outlet_id: oid,
      menu_cat_id: Number(cat.menu_cat_id),
      name: cat.category_name || cat.name,
      is_active: cat.is_active === 1 || cat.is_active === true,
      menu_count: cat.menu_count ?? existing?.menu_count ?? 0,
      dirty: false,
      deleted: false,
      updated_at: now,
      created_at: existing?.created_at || now,
    });
  }
}

export async function applyCategoryIdMapping(syncUuid, menuCatId) {
  const row = await db.menu_categories.get(syncUuid);
  if (!row) return;
  await db.menu_categories.put({
    ...row,
    menu_cat_id: Number(menuCatId),
    dirty: false,
    deleted: false,
  });
}

export async function applyPulledCategories(outletId, items = []) {
  const oid = Number(outletId);
  const now = new Date().toISOString();
  for (const item of items) {
    const sync_uuid = item.sync_uuid || createSyncUuid();
    const existing = await db.menu_categories.get(sync_uuid);
    if (existing?.dirty) continue;

    await db.menu_categories.put({
      sync_uuid,
      outlet_id: oid,
      menu_cat_id: item.menu_cat_id ?? existing?.menu_cat_id ?? null,
      name: item.name || item.category_name,
      is_active: item.is_active !== false && item.is_active !== 0,
      menu_count: item.menu_count ?? existing?.menu_count ?? 0,
      dirty: false,
      deleted: Boolean(item.deleted),
      updated_at: item.updated_at || now,
      created_at: existing?.created_at || now,
    });
  }
}

export function categoryToPushPayload(row) {
  return {
    sync_uuid: row.sync_uuid,
    outlet_id: Number(row.outlet_id),
    name: row.name,
    is_active: Boolean(row.is_active) && !row.deleted,
  };
}
