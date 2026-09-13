"use client";

import { RISK_META } from "@/data/mockData";

export default function RiskBadge({ level, size = "md" }) {
  const meta = RISK_META[level] || RISK_META.normal;
  const padding = size === "sm" ? "3px 8px" : "5px 11px";
  const fontSize = size === "sm" ? 11 : 12.5;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding,
        borderRadius: 999,
        fontSize,
        fontWeight: 600,
        background: `${meta.color}1f`,
        color: meta.color,
        border: `1px solid ${meta.color}55`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: meta.color,
        }}
      />
      {meta.label}
    </span>
  );
}
