"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

// Poll live weather without reloading the page. Demo risk is recalculated
// from the latest weather inputs on each poll.
export default function LiveDataLoader() {
  const refreshLive = useStore((state) => state.refreshLive);

  useEffect(() => {
    refreshLive();
    const intervalId = window.setInterval(refreshLive, 120_000);
    return () => window.clearInterval(intervalId);
  }, [refreshLive]);

  return null;
}
