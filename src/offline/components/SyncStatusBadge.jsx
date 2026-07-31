import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faCloudArrowDown,
  faWifi,
  faBan,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { useSync } from "../hooks/useSync";

/**
 * Compact sync indicator for Header / outlet pages.
 */
export default function SyncStatusBadge({ outletId, className = "" }) {
  const { online, status, message, pending, syncNow, setActiveOutlet } =
    useSync();

  React.useEffect(() => {
    if (outletId) setActiveOutlet(Number(outletId));
  }, [outletId, setActiveOutlet]);

  const label = !online
    ? "Offline"
    : status === "syncing"
      ? "Syncing…"
      : pending > 0
        ? `${pending} pending`
        : status === "error"
          ? "Sync issue"
          : "Synced";

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

  return (
    <button
      type="button"
      title={
        message ||
        (online
          ? "Tap to sync now (bypasses sync interval)"
          : "You are offline")
      }
      onClick={() => syncNow(outletId)}
      disabled={status === "syncing" || !online}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${color} ${className} disabled:opacity-70`}
    >
      <FontAwesomeIcon
        icon={online ? icon : faWifi}
        className={`w-3.5 h-3.5 ${status === "syncing" ? "animate-spin" : ""}`}
      />
      <span>{label}</span>
    </button>
  );
}
