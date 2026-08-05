import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAdmin } from "../../hooks/useAdmin";
import { subscribeOnlineStatus, isOnline } from "../network";
import {
  subscribeSyncState,
  syncOutlet,
  getPendingDirtyCount,
} from "../syncService";

const LAST_OUTLET_KEY = "mm_last_sync_outlet_id";
const AUTO_SYNC_CHECK_MS = 30 * 60 * 1000; // re-check interval every 30 min

/** Extract outlet id from outlet-scoped routes. */
export function parseOutletIdFromPath(pathname) {
  const match = pathname.match(
    /\/(?:view-outlet|edit-outlet|outlet-configuration|categories|category-details|create-category|edit-category|menus|menu-details|create-menu|edit-menu|staff|create-staff|staff-details|edit-staff)\/(\d+)/
  );
  return match ? Number(match[1]) : null;
}

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
  const location = useLocation();
  const [online, setOnline] = useState(isOnline());
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(0);
  const [lastOutletId, setLastOutletId] = useState(() => {
    const saved = localStorage.getItem(LAST_OUTLET_KEY);
    return saved ? Number(saved) : null;
  });
  const lastOutletRef = useRef(lastOutletId);
  const autoSyncTimer = useRef(null);

  useEffect(() => {
    lastOutletRef.current = lastOutletId;
  }, [lastOutletId]);

  useEffect(() => subscribeOnlineStatus(setOnline), []);

  // Track active outlet from URL (outlet pages) or restore last visited
  useEffect(() => {
    const fromUrl = parseOutletIdFromPath(location.pathname);
    if (fromUrl) {
      setLastOutletId(fromUrl);
      localStorage.setItem(LAST_OUTLET_KEY, String(fromUrl));
    }
  }, [location.pathname]);

  useEffect(() => {
    return subscribeSyncState((state) => {
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
        localStorage.setItem(LAST_OUTLET_KEY, String(state.outletId));
      }
      if (typeof state.pending === "number") {
        setPending((prev) => (prev === state.pending ? prev : state.pending));
      }
    });
  }, []);

  const runAutoSync = useCallback(
    (outletId) => {
      if (!online || !outletId || !adminData?.user_id) return;
      syncOutlet(outletId, {
        userId: adminData.user_id,
        force: false,
      }).then(async (result) => {
        const oid = lastOutletRef.current;
        if (oid) setPending(await getPendingDirtyCount(oid));
        return result;
      });
    },
    [online, adminData?.user_id]
  );

  // Debounced auto-sync when coming online / outlet changes
  useEffect(() => {
    if (!online || !lastOutletId || !adminData?.user_id) return;

    if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
    autoSyncTimer.current = setTimeout(() => {
      runAutoSync(lastOutletId);
    }, 400);

    return () => {
      if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
    };
  }, [online, lastOutletId, adminData?.user_id, runAutoSync]);

  // Periodic + visibility auto-sync (respects 10/15/30 day interval per outlet)
  useEffect(() => {
    if (!online || !lastOutletId || !adminData?.user_id) return;

    const intervalId = setInterval(() => {
      runAutoSync(lastOutletId);
    }, AUTO_SYNC_CHECK_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        runAutoSync(lastOutletId);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [online, lastOutletId, adminData?.user_id, runAutoSync]);

  const syncNow = useCallback(
    async (outletId) => {
      const oid = outletId || lastOutletRef.current;
      if (!oid) return { ok: false, reason: "missing_outlet" };
      setLastOutletId(Number(oid));
      localStorage.setItem(LAST_OUTLET_KEY, String(oid));

      const result = await syncOutlet(oid, {
        userId: adminData?.user_id,
        force: true,
      });

      if (result.ok) {
        setPending(await getPendingDirtyCount(oid));
        try {
          const { queryClient } = await import(
            "../../lib/react-query/queryClient"
          );
          const { queryKeys } = await import(
            "../../lib/react-query/queryKeys"
          );
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
      }

      return result;
    },
    [adminData?.user_id]
  );

  const setActiveOutlet = useCallback((id) => {
    const next = id == null ? null : Number(id);
    setLastOutletId((prev) => (prev === next ? prev : next));
    if (next != null) {
      localStorage.setItem(LAST_OUTLET_KEY, String(next));
    }
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
