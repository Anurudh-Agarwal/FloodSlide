"use client";

import { create } from "zustand";
import {
  initialVillages,
  initialReports,
  RISK_LEVELS,
} from "@/data/mockData";

let reportCounter = initialReports.length + 1;

function severityRank(level) {
  return RISK_LEVELS.indexOf(level);
}

export const useStore = create((set, get) => ({
  villages: initialVillages,
  reports: initialReports,
  helplineOpen: false,

  // ---- derived helpers ----
  getVillage: (id) => get().villages.find((v) => v.id === id),

  getMostSevereVillage: () => {
    const active = get().villages.filter((v) => v.status !== "resolved");
    if (active.length === 0) return null;
    return [...active].sort(
      (a, b) => severityRank(b.riskLevel) - severityRank(a.riskLevel) || b.riskScore - a.riskScore
    )[0];
  },

  getReportsForVillage: (villageId) =>
    get().reports.filter((r) => r.villageId === villageId),

  // ---- actions ----
  addReport: ({ villageId, type, description, image, reporterName }) => {
    const report = {
      id: `rep-${String(reportCounter++).padStart(2, "0")}`,
      villageId: villageId || null,
      type,
      description,
      image: image || null,
      reporterName: reporterName || "Anonymous report",
      timestamp: Date.now(),
    };
    set((state) => ({ reports: [report, ...state.reports] }));
    return report;
  },

  setVillageStatus: (villageId, status) => {
    set((state) => ({
      villages: state.villages.map((v) =>
        v.id === villageId ? { ...v, status } : v
      ),
    }));
  },

  // Demo-only: simulate a sensor push changing a village's risk level.
  simulateSensorTrigger: (villageId, riskLevel) => {
    set((state) => ({
      villages: state.villages.map((v) => {
        if (v.id !== villageId) return v;
        const bump =
          riskLevel === "critical"
            ? 90
            : riskLevel === "warning"
            ? 65
            : riskLevel === "watch"
            ? 35
            : 10;
        return {
          ...v,
          riskLevel,
          riskScore: bump,
          status: "unverified",
          lastUpdated: Date.now(),
          history: [...v.history, { t: Date.now(), level: riskLevel }],
        };
      }),
    }));
  },

  toggleHelpline: (open) =>
    set((state) => ({
      helplineOpen: open !== undefined ? open : !state.helplineOpen,
    })),
}));
