import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const lastOutletRef = useRef(null);
  const autoSyncTimer = useRef(null);

  useEffect(() => {
    lastOutletRef.current = lastOutletId;
  }, [lastOutletId]);

  useEffect(() => subscribeOnlineStatus(setOnline), []);

  useEffect(() => {
    return subscribeSyncState((state) => {
      // Avoid re-rendering the whole app when nothing meaningful changed
      if (state.status != null) {
        setStatus((prev) => (prev === state.status ? prev : state.status));
      }
      if (state.message != null) {
        setMessage((prev) => (prev === state.message ? prev : state.message));
      }
      if (state.outletId != null) {
        setLastOutletId((prev) =>
          prev === state.outletId ? prev : state.outletId
        );
      }
      if (typeof state.pending === "number") {
        setPending((prev) => (prev === state.pending ? prev : state.pending));
      }
    });
  }, []);

  // Debounced auto-sync when coming online / outlet changes
  useEffect(() => {
    if (!online || !lastOutletId || !adminData?.user_id) return;

    if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
    autoSyncTimer.current = setTimeout(() => {
      syncOutlet(lastOutletId, {
        userId: adminData.user_id,
        force: false,
      }).then(async () => {
        const oid = lastOutletRef.current;
        if (oid) setPending(await getPendingDirtyCount(oid));
      });
    }, 400);

    return () => {
      if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
    };
  }, [online, lastOutletId, adminData?.user_id]);

  const syncNow = useCallback(
    async (outletId) => {
      const oid = outletId || lastOutletRef.current;
      if (!oid) return { ok: false, reason: "missing_outlet" };
      setLastOutletId(Number(oid));
      return syncOutlet(oid, { userId: adminData?.user_id, force: true });
    },
    [adminData?.user_id]
  );

  const setActiveOutlet = useCallback((id) => {
    const next = id == null ? null : Number(id);
    setLastOutletId((prev) => (prev === next ? prev : next));
  }, []);

  const value = useMemo(
    () => ({
      online,
      status,
      message,
      pending,
      lastOutletId,
      syncNow,
      setActiveOutlet,
    }),
    [online, status, message, pending, lastOutletId, syncNow, setActiveOutlet]
  );

  return (
    <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}
