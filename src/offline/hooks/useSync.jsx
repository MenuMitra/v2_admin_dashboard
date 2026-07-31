import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { subscribeOnlineStatus, isOnline } from "../network";
import {
  subscribeSyncState,
  syncOutlet,
  getPendingDirtyCount,
} from "../syncService";

const SyncContext = createContext({
  online: true,
  status: "idle",
  message: "",
  pending: 0,
  lastOutletId: null,
  syncNow: async () => {},
});

export function SyncProvider({ children }) {
  const { adminData } = useAdmin();
  const [online, setOnline] = useState(isOnline());
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(0);
  const [lastOutletId, setLastOutletId] = useState(null);

  useEffect(() => subscribeOnlineStatus(setOnline), []);

  useEffect(() => {
    return subscribeSyncState((state) => {
      setStatus(state.status || "idle");
      setMessage(state.message || "");
      if (state.outletId != null) setLastOutletId(state.outletId);
      if (typeof state.pending === "number") setPending(state.pending);
    });
  }, []);

  // Auto-sync last outlet when coming back online (only if interval is due)
  useEffect(() => {
    if (!online || !lastOutletId || !adminData?.user_id) return;
    syncOutlet(lastOutletId, {
      userId: adminData.user_id,
      force: false,
    }).then(async (res) => {
      if (lastOutletId) {
        setPending(await getPendingDirtyCount(lastOutletId));
      }
      return res;
    });
  }, [online, lastOutletId, adminData?.user_id]);

  const syncNow = useCallback(
    async (outletId) => {
      const oid = outletId || lastOutletId;
      if (!oid) return { ok: false, reason: "missing_outlet" };
      setLastOutletId(Number(oid));
      // Manual tap always syncs immediately
      return syncOutlet(oid, { userId: adminData?.user_id, force: true });
    },
    [adminData?.user_id, lastOutletId]
  );

  const value = useMemo(
    () => ({
      online,
      status,
      message,
      pending,
      lastOutletId,
      syncNow,
      setActiveOutlet: setLastOutletId,
    }),
    [online, status, message, pending, lastOutletId, syncNow]
  );

  return (
    <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}
