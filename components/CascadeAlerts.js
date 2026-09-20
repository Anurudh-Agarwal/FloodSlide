"use client";

import { RISK_META } from "@/data/mockData";
import { cascadeAlertFor } from "@/lib/predictionPipeline";

const STAGES = [
  { id: "regional", level: "watch", titleKey: "cascadeRegional", fallback: "Regional Watch" },
  { id: "catchment", level: "warning", titleKey: "cascadeCatchment", fallback: "Catchment Warning" },
  { id: "imminent", level: "critical", titleKey: "cascadeImminent", fallback: "Imminent Alert" },
];

export default function CascadeAlerts({ riskLevel, t }) {
  const active = cascadeAlertFor(riskLevel);
  const rank = { none: 0, regional: 1, catchment: 2, imminent: 3 }[active] || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {STAGES.map((s, i) => {
        const on = rank >= i + 1;
        const color = RISK_META[s.level].color;
        return (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${on ? color : "var(--line)"}`,
              background: on ? `${color}18` : "var(--bg-panel)",
              opacity: on ? 1 : 0.55,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: on ? color : "var(--text-faint)",
              }}
            />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: on ? color : "var(--text-muted)" }}>
                {t(s.titleKey) || s.fallback}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                {on ? t("cascadeActive") : t("cascadeInactive")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
