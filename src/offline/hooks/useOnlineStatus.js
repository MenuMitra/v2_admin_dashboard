import { useEffect, useState } from "react";
import { isOnline, subscribeOnlineStatus } from "../network";

export function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => subscribeOnlineStatus(setOnline), []);

  return online;
}
