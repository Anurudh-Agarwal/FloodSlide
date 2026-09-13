"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import SeverityBanner from "@/components/SeverityBanner";
import VillageListPanel from "@/components/VillageListPanel";
import DemoControls from "@/components/DemoControls";
import ReportForm from "@/components/ReportForm";

const VillageMap = dynamic(() => import("@/components/VillageMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-faint)",
        fontSize: 13,
      }}
    >
      Loading map…
    </div>
  ),
});

export default function HomePage() {
  const villages = useStore((s) => s.villages);
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)" }}>
      <SeverityBanner />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <VillageMap villages={villages} />
          <DemoControls villages={villages} />
          <button
            onClick={() => setReportOpen(true)}
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              zIndex: 400,
              padding: "12px 18px",
              borderRadius: 999,
              border: "none",
              background: "var(--risk-critical)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13.5,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            + Report incident
          </button>
        </div>
        <div
          style={{
            width: 300,
            flexShrink: 0,
            borderLeft: "1px solid var(--line)",
            background: "var(--bg-panel)",
          }}
        >
          <VillageListPanel villages={villages} />
        </div>
      </div>
      {reportOpen && (
        <ReportForm villages={villages} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}
