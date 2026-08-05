import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faCloudArrowDown,
  faWifi,
  faBan,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { useSync } from "../hooks/useSync";
import { toastController } from "../../utils/toastController";

/**
 * Sync button for Header (profile area) and outlet pages.
 * Manual click → POST /v1/sync with force (bypasses auto-sync interval).
 */
export default function SyncStatusBadge({ outletId, className = "" }) {
  const {
    online,
    status,
    message,
    pending,
    lastOutletId,
    syncNow,
    setActiveOutlet,
  } = useSync();

  React.useEffect(() => {
    if (outletId) setActiveOutlet(Number(outletId));
  }, [outletId, setActiveOutlet]);

  const activeOutlet = outletId || lastOutletId;

  const label = !online
    ? "Offline"
    : status === "syncing"
      ? "Syncing…"
      : pending > 0
        ? `${pending} pending`
        : status === "error"
          ? "Sync failed"
          : "Sync";

  const color = !online
    ? "bg-amber-100 text-amber-800 border-amber-200"
    : status === "syncing"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : status === "error"
        ? "bg-red-100 text-red-800 border-red-200"
        : pending > 0
          ? "bg-orange-100 text-orange-800 border-orange-200"
          : "bg-emerald-100 text-emerald-800 border-emerald-200";

  const icon = !online
    ? faBan
    : status === "syncing"
      ? faRotate
      : pending > 0
        ? faCloudArrowUp
        : faCloudArrowDown;

  const handleClick = useCallback(async () => {
    if (!online) {
      toastController.error("You are offline — sync when back online.");
      return;
    }
    if (!activeOutlet) {
      toastController.error("Open an outlet page first, then tap Sync.");
      return;
    }

    const result = await syncNow(activeOutlet);

    if (result?.ok) {
      toastController.success(
        result.pending
          ? `Synced — ${result.pending} change(s) still pending`
          : "All data synced successfully"
      );
    } else if (result?.reason === "sync_api_error") {
      toastController.error(
        message || "Sync API failed — changes saved locally"
      );
    } else if (result?.reason === "offline") {
      toastController.error("You are offline");
    } else if (result?.reason !== "not_due") {
      toastController.error(message || "Sync failed");
    }
  }, [online, activeOutlet, syncNow, message]);

  const tooltip = !online
    ? "Offline — sync when connected"
    : !activeOutlet
      ? "Open an outlet to enable sync"
      : message ||
        (pending > 0
          ? `${pending} local change(s) — tap to sync now`
          : "Tap to sync now (manual sync bypasses auto-sync interval)");

  return (
    <button
      type="button"
      title={tooltip}
      onClick={handleClick}
      disabled={status === "syncing" || !online}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition sm:gap-2 sm:px-3 ${color} ${className} disabled:opacity-70`}
    >
      <FontAwesomeIcon
        icon={online ? icon : faWifi}
        className={`h-3.5 w-3.5 ${status === "syncing" ? "animate-spin" : ""}`}
      />
      <span>{label}</span>
    </button>
  );
}
