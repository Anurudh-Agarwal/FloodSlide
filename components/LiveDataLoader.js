"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

// Poll live weather without reloading the page. Fixed demo risk values are
// returned separately by the API and are unaffected by this polling.
export default function LiveDataLoader() {
  const refreshLive = useStore((state) => state.refreshLive);

  useEffect(() => {
    refreshLive();
    const intervalId = window.setInterval(refreshLive, 5000);
    return () => window.clearInterval(intervalId);
  }, [refreshLive]);

  return null;
}
