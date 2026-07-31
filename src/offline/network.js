/**
 * Online/offline helpers. Uses navigator.onLine plus optional ping.
 */

export function isOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function subscribeOnlineStatus(onChange) {
  const handleOnline = () => onChange(true);
  const handleOffline = () => onChange(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
