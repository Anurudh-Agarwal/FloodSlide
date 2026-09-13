"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { RISK_META } from "@/data/mockData";

export default function SeverityBanner() {
  const village = useStore((s) => s.getMostSevereVillage());

  if (!village || village.riskLevel === "normal") {
    return (
      <div
        style={{
          padding: "10px 20px",
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--line)",
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        No elevated risk across monitored villages right now.{" "}
        <span className="mono" style={{ color: "var(--text-faint)" }}>
          — demo data
        </span>
      </div>
    );
  }

  const meta = RISK_META[village.riskLevel];
  const isCritical = village.riskLevel === "critical";

  return (
    <Link
      href={`/village/${village.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 20px",
        background: `${meta.color}14`,
        borderBottom: `1px solid ${meta.color}55`,
        textDecoration: "none",
        color: "var(--text-primary)",
      }}
    >
      <span
        className={isCritical ? "risk-pulse" : undefined}
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: meta.color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13.5 }}>
        <strong style={{ fontWeight: 600 }}>
          {meta.label}: {village.name}
        </strong>{" "}
        <span style={{ color: "var(--text-muted)" }}>
          ({village.ward}) — {meta.short}
        </span>
      </span>
      <span
        className="mono"
        style={{
          marginLeft: "auto",
          fontSize: 12,
          color: "var(--text-faint)",
        }}
      >
        risk score {village.riskScore} · view details →
      </span>
    </Link>
  );
}
