import React, { useMemo } from "react";

const APP_LABELS = {
  pos: "POS App",
  pos_app: "POS App",
  pos_software: "POS Software",
  mobile: "Mobile App",
  mobile_app: "Mobile App",
  cds: "CDS",
  kds: "KDS",
  customer: "Customer App",
  customer_app: "Customer App",
  owner: "Owner App",
  owner_app: "Owner App",
  admin: "Admin App",
  admin_app: "Admin App",
};

const VERSION_KEYS = [
  "app_version",
  "version",
  "last_version",
  "last_app_version",
  "client_version",
  "build_version",
  "software_version",
  "apk_version",
  "api_version",
];

const LAST_CALL_KEYS = [
  "last_activity",
  "last_api_call",
  "last_api_call_on",
  "last_accessed",
  "last_call",
  "last_used_on",
];

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function toTitleDisplay(str) {
  if (!str) return "";
  return String(str)
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function pickByKeys(source, keys) {
  if (!source || typeof source !== "object") return null;

  const exact = Object.fromEntries(
    Object.entries(source).map(([key, value]) => [normalizeKey(key), value])
  );

  for (const key of keys) {
    const value = exact[normalizeKey(key)];
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }
  return null;
}

function pickVersion(item) {
  const known = pickByKeys(item, VERSION_KEYS);
  if (known !== null) return known;

  if (!item || typeof item !== "object") return null;

  for (const [key, value] of Object.entries(item)) {
    if (value === null || value === undefined || value === "") continue;
    const normalized = normalizeKey(key);
    if (normalized.includes("version") && typeof value !== "object") {
      return value;
    }
  }
  return null;
}

function resolveAppName(item) {
  if (item?.module_name) return toTitleDisplay(item.module_name);

  const typeKey = normalizeKey(
    item?.app_type || item?.system || item?.app_source || item?.app || item?.name
  );
  if (typeKey && APP_LABELS[typeKey]) return APP_LABELS[typeKey];
  if (typeKey) return toTitleDisplay(typeKey);
  return "Unknown App";
}

function resolveAppId(item, index) {
  return (
    normalizeKey(item?.app_type) ||
    normalizeKey(item?.module_name) ||
    `app-${index}`
  );
}

function buildAppUsageRows(appUsageList) {
  const list = Array.isArray(appUsageList) ? appUsageList : [];

  return list.map((item, index) => ({
    id: resolveAppId(item, index),
    name: resolveAppName(item),
    lastApiCall: pickByKeys(item, LAST_CALL_KEYS),
    version: pickVersion(item),
    totalApiCalls: pickByKeys(item, [
      "total_api_calls",
      "api_calls",
      "total_calls",
    ]),
    isSubscribed:
      item?.is_subscribed === undefined || item?.is_subscribed === null
        ? null
        : Boolean(item.is_subscribed),
  }));
}

function formatDisplay(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function OutletAppUsage({ appUsage }) {
  const rows = useMemo(() => buildAppUsageRows(appUsage), [appUsage]);
  const hasSourceData = Array.isArray(appUsage);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          App Usage
        </h2>
      </div>

      {!hasSourceData || rows.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-3 text-sm text-gray-500 bg-white">
          No app usage data available for this outlet.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-2.5 font-medium">App</th>
                <th className="px-4 py-2.5 font-medium">Last API Call</th>
                <th className="px-4 py-2.5 font-medium">App Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="text-gray-800">
                  <td className="px-4 py-2.5 whitespace-nowrap font-medium">
                    {row.name}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">
                    {formatDisplay(row.lastApiCall)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">
                    {formatDisplay(row.version)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OutletAppUsage;
